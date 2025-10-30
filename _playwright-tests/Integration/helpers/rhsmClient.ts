import { URL } from 'url';
import { ExecReturn, killContainer, runCommand, startNewContainer } from './containers';

/**
 * Supported Operating System versions
 */
export type OSVersion = 'rhel9' | 'rhel8' | 'rhel9dev';

/**
 * List of containers to use
 */
const RemoteImages = {
  rhel9: 'quay.io/swadeley/ubi9_rhc_prod:latest',
  rhel8: 'quay.io/swadeley/ubi8_rhc_prod:latest',
  rhel9dev: 'quay.io/swadeley/ubi9_rhc_dev_prod:latest',
};

/**
 * Class to start and manage a registered RHSM/insights client
 */
export class RHSMClient {
  name: string;
  constructor(name: string) {
    this.name = name;
  }

  /**
   * Starts an rhsm client container and waits for services to be ready
   * @param version OS and version to boot
   * @returns
   */
  async Boot(version: OSVersion) {
    await startNewContainer(this.name, RemoteImages[version]);

    // Wait for systemd and dbus to be ready
    await this.waitForServicesReady();
  }

  /**
   * Waits for systemd services (especially dbus) to be ready
   * @returns
   */
  private async waitForServicesReady() {
    // Wait for systemd to be ready
    let attempts = 0;
    const maxAttempts = 30; // 30 seconds max wait

    while (attempts < maxAttempts) {
      try {
        // Check if dbus socket exists
        const dbusCheck = await runCommand(
          this.name,
          ['test', '-S', '/var/run/dbus/system_bus_socket'],
          1000,
        );
        if (dbusCheck?.exitCode === 0) {
          console.log(`Services ready for container ${this.name}`);
          return;
        }

        // If dbus socket doesn't exist, try to start dbus service
        if (attempts === 5) {
          console.log(`Attempting to start dbus service for container ${this.name}`);
          await runCommand(this.name, ['systemctl', 'start', 'dbus'], 5000);
        }
      } catch {
        console.log(
          `Waiting for services in container ${this.name}, attempt ${attempts + 1}/${maxAttempts}`,
        );
      }

      await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1 second
      attempts++;
    }

    console.warn(
      `Services may not be fully ready for container ${this.name} after ${maxAttempts} seconds`,
    );
  }

  /**
   * configures this client for stage registration
   * @returns
   */
  async ConfigureSubManForStage() {
    return runCommand(this.name, stageConfigureCommand());
  }

  /**
   * configures this client for stage registration
   * @returns
   */
  async ConfigureRHCForStage() {
    const command = [
      'sh',
      '-c',
      `echo "proxy=${process.env.PROXY}" >> /etc/insights-client/insights-client.conf`,
    ];
    return runCommand(this.name, command);
  }

  /**
   * Registers to configured environment using RHC
   * @param activationKey key to register with.  Defaults to $ACTIVATION_KEY_1
   * @param orgId orgId to register with.  Defaults to $ORG_ID_1
   * @param template template name to register with.
   * @returns
   */
  async RegisterRHC(activationKey?: string, orgId?: string, template?: string) {
    if (!process.env.PROD) {
      await this.ConfigureSubManForStage();
      await this.ConfigureRHCForStage();
    }
    if (activationKey == undefined) {
      activationKey = process.env.ACTIVATION_KEY_1 || 'COULD_NOT_FIND_KEY';
    }
    if (orgId == undefined) {
      orgId = process.env.ORG_ID_1 || 'COULD_NOT_FIND_ORG_ID';
    }
    const connect = ['rhc', 'connect', '-a', activationKey, '-o', orgId];
    if (template != undefined) {
      connect.push('--content-template');
      connect.push(`${template}`);
    }
    return runCommand(this.name, connect, 75000);
  }

  /**
   * Register using subscription-manager (won't show up in insights)
   * @param activationKey key to register with.  Defaults to $ACTIVATION_KEY_1
   * @param orgId orgId to register with.  Defaults to $ORG_ID_1
   * @returns
   */
  async RegisterSubMan(activationKey?: string, orgId?: string) {
    if (!process.env.PROD) {
      await this.ConfigureSubManForStage();
    }

    if (activationKey == undefined) {
      activationKey = process.env.ACTIVATION_KEY_1 || 'COULD_NOT_FIND_KEY';
    }
    if (orgId == undefined) {
      orgId = process.env.ORG_ID_1 || 'COULD_NOT_FIND_ORG_ID';
    }

    return runCommand(
      this.name,
      [
        'subscription-manager',
        'register',
        '--activationkey',
        activationKey,
        '--org=' + orgId,
        '--name',
        this.name,
      ],
      75000,
    );
  }

  /**
   * Run an arbitrary command on the host
   * @param command Command to run
   * @param timeout Timeout in ms to cancel the command, defaults to 500ms
   * @returns
   */
  async Exec(command: string[], timeout?: number): Promise<ExecReturn | void> {
    return runCommand(this.name, command, timeout);
  }

  /**
   * Unregister with subscription-manager
   * @returns
   */
  async Unregister(withRhc: boolean) {
    if (withRhc) {
      const stream = await runCommand(this.name, ['systemctl', 'status', 'rhcd.service']);
      if (stream != undefined) {
        console.log(stream.stdout);
        console.log(stream.stderr);
        console.log(stream.exitCode);
      }
      return runCommand(this.name, ['rhc', 'disconnect']);
    } else {
      return runCommand(this.name, ['subscription-manager', 'disconnect']);
    }
  }

  /**
   * Unregister and destroy the client container
   * @param unregisterMethod Method to use for unregistering: 'rhc', 'sm', or 'none' (default)
   */
  async Destroy(unregisterMethod: 'rhc' | 'sm' | 'none' = 'none') {
    if (unregisterMethod !== 'none') {
      const cmd = await this.Unregister(unregisterMethod === 'rhc');
      // Log only exit code and sanitized output to avoid exposing sensitive information
      console.log('Unregister command completed with exit code:', cmd?.exitCode);
      if (
        cmd?.stderr &&
        !cmd.stderr.includes('--activationkey') &&
        !cmd.stderr.includes('--password') &&
        !cmd.stderr.includes('-a') &&
        !cmd.stderr.includes('-p')
      ) {
        console.log('STDERR:', cmd.stderr);
      }
    }
    return killContainer(this.name);
  }
}

/**
 * Refreshes subscription-manager with retry logic to handle intermittent failures
 * @param client The RHSMClient instance to execute the refresh command on
 * @param maxAttempts Maximum number of retry attempts (default: 3)
 * @returns Promise that resolves when refresh succeeds or throws on final failure
 */
export async function refreshSubscriptionManager(
  client: RHSMClient,
  maxAttempts: number = 3,
): Promise<void> {
  let subManRefresh;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      subManRefresh = await client.Exec(['subscription-manager', 'refresh']);
      if (subManRefresh?.exitCode === 0) {
        return; // Success, exit early
      }
      if (subManRefresh?.stderr || subManRefresh?.stdout) {
        console.log(`subscription-manager refresh attempt ${attempt} failed:`);
        // Only log output if it doesn't contain sensitive information
        if (
          subManRefresh?.stdout &&
          !subManRefresh.stdout.includes('--activationkey') &&
          !subManRefresh.stdout.includes('--password') &&
          !subManRefresh.stdout.includes('-a') &&
          !subManRefresh.stdout.includes('-p')
        ) {
          console.log('STDOUT:', subManRefresh.stdout);
        }
        if (
          subManRefresh?.stderr &&
          !subManRefresh.stderr.includes('--activationkey') &&
          !subManRefresh.stderr.includes('--password') &&
          !subManRefresh.stderr.includes('-a') &&
          !subManRefresh.stderr.includes('-p')
        ) {
          console.log('STDERR:', subManRefresh.stderr);
        }
      }
    } catch (error) {
      console.log(`subscription-manager refresh attempt ${attempt} error:`, error);
      if (attempt === maxAttempts) throw error;
    }
  }

  // If we get here, all attempts failed but didn't throw
  throw new Error(
    `subscription-manager refresh failed after ${maxAttempts} attempts. Exit code: ${subManRefresh?.exitCode}`,
  );
}

const stageConfigureCommand = (): string[] => {
  const command = [
    'subscription-manager',
    'config',
    '--server.hostname=subscription.rhsm.stage.redhat.com',
    '--server.port=443',
    '--server.prefix=/subscription',
    '--server.insecure=0',
    '--rhsm.baseurl=https://stagecdn.redhat.com',
  ];
  if (process.env.PROXY !== undefined) {
    const url = new URL(process.env.PROXY);
    command.push('--server.proxy_hostname=' + url.hostname);
    command.push('--server.proxy_port=' + url.port);
  }
  return command;
};
