import {
  Breadcrumb,
  BreadcrumbItem,
  Button,
  Card,
  EmptyState,
  EmptyStateBody,
  EmptyStateVariant,
  ExpandableSection,
  Flex,
  FlexItem,
  Grid,
  PageSection,
  Stack,
} from '@patternfly/react-core';
import { KeyIcon } from '@patternfly/react-icons';
import { SkeletonTable } from '@patternfly/react-component-groups';
import {
  Table,
  TableVariant,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  type BaseCellProps,
} from '@patternfly/react-table';
import { type ComponentProps, useState } from 'react';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';

import Header from 'components/Header/Header';
import Hide from 'components/Hide/Hide';
import { NoPermissionsPage } from 'components/NoPermissionsPage/NoPermissionsPage';
import { useLightwellNavigateTo } from 'Hooks/Lightwell/navigation/useLightwellNavigateTo';
import { canManageLightwellTokens, useIsOrgAdmin } from 'Hooks/Lightwell/useIsOrgAdmin';
import { formatDateDDMMMYYYY } from 'helpers';
import { useAppContext } from 'middleware/AppContext';
import type { LightwellTokenResponse } from 'services/LightwellTokens/LightwellTokensApi';
import { useLightwellTokensQuery } from 'services/LightwellTokens/LightwellTokensQueries';

import CreateTokenModal from './CreateTokenModal';
import RevokeTokenModal from './RevokeTokenModal';

const formatOptionalDate = (date?: string | null) => (date ? formatDateDDMMMYYYY(date, true) : '—');

const isRevoked = (token: LightwellTokenResponse) => !!token.revoked_at;

type TokenColumn = {
  title: string;
  width?: BaseCellProps['width'];
  info?: ComponentProps<typeof Th>['info'];
};

const activeColumnHeaders: TokenColumn[] = [
  { title: 'Name' },
  { title: 'Prefix', width: 15 },
  { title: 'User', width: 15 },
  { title: 'Expires', width: 15 },
  { title: 'Last used', width: 15 },
  { title: 'Created', width: 15 },
];

const revokedColumnHeaders: TokenColumn[] = [
  ...activeColumnHeaders,
  { title: 'Revoked', width: 15 },
];

const TokensTable = () => {
  const { features, rbac, isFetchingPermissions } = useAppContext();
  const { isOrgAdmin, isLoading: isOrgAdminLoading } = useIsOrgAdmin();
  const { navigateTo } = useLightwellNavigateTo();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isRevokedExpanded, setIsRevokedExpanded] = useState(false);
  const [tokenToRevoke, setTokenToRevoke] = useState<Pick<
    LightwellTokenResponse,
    'uuid' | 'name'
  > | null>(null);

  const canManage = canManageLightwellTokens(features, isOrgAdmin);
  const canWrite = !!rbac?.repoWrite;
  const canRead = rbac?.repoRead !== false;

  const gatesLoading = isFetchingPermissions || isOrgAdminLoading || features === null;

  const {
    isLoading,
    isError,
    error,
    data: tokens = [],
  } = useLightwellTokensQuery(canManage && canRead && !gatesLoading);

  if (!gatesLoading && (!canManage || !canRead)) {
    return <NoPermissionsPage />;
  }

  if (isError) throw error;

  const activeTokens = tokens.filter((token) => !isRevoked(token));
  const revokedTokens = tokens.filter(isRevoked);
  const hasNoTokens = tokens.length === 0;
  const showSkeleton = gatesLoading || isLoading;

  return (
    <>
      <Header
        title='Access tokens'
        ouiaId='lightwell-tokens-header'
        paragraph='Create and revoke organization access tokens for Lightwell package repositories.'
        showOpenSourceBadge={false}
      />
      <PageSection hasBodyWrapper={false} className={`${spacing.pt_0} ${spacing.pb_2xl}`}>
        <Grid data-ouia-component-id='lightwell-tokens-page'>
          <Breadcrumb ouiaId='lightwell-tokens-breadcrumb' className={spacing.mbMd}>
            <BreadcrumbItem
              to='#'
              onClick={(event) => {
                event.preventDefault();
                navigateTo('repositories');
              }}
            >
              Repositories
            </BreadcrumbItem>
            <BreadcrumbItem isActive>Access tokens</BreadcrumbItem>
          </Breadcrumb>

          <Hide hide={!canWrite}>
            <Flex className={spacing.mbMd} justifyContent={{ default: 'justifyContentFlexEnd' }}>
              <FlexItem>
                <Button
                  variant='primary'
                  ouiaId='lightwell-create-token-button'
                  onClick={() => setIsCreateOpen(true)}
                >
                  Create access token
                </Button>
              </FlexItem>
            </Flex>
          </Hide>

          <Hide hide={!showSkeleton}>
            <Stack>
              <SkeletonTable
                rows={5}
                columnsCount={activeColumnHeaders.length + (canWrite ? 1 : 0)}
                variant={TableVariant.compact}
              />
            </Stack>
          </Hide>

          <Hide hide={showSkeleton || !hasNoTokens}>
            <EmptyState
              headingLevel='h4'
              icon={KeyIcon}
              titleText='No access tokens'
              variant={EmptyStateVariant.lg}
            >
              <EmptyStateBody>
                Create an access token to authenticate against Lightwell repositories.
              </EmptyStateBody>
              <Hide hide={!canWrite}>
                <Button
                  variant='primary'
                  ouiaId='lightwell-create-token-empty-button'
                  onClick={() => setIsCreateOpen(true)}
                >
                  Create access token
                </Button>
              </Hide>
            </EmptyState>
          </Hide>

          <Hide hide={showSkeleton || hasNoTokens}>
            <Stack hasGutter>
              <Hide hide={activeTokens.length === 0}>
                <Card className={`${spacing.ptLg} ${spacing.pb_2xl} ${spacing.pxLg}`}>
                  <Table
                    aria-label='Lightwell access tokens table'
                    ouiaId='lightwell-tokens-table'
                    isStriped
                  >
                    <Thead>
                      <Tr>
                        {activeColumnHeaders.map(({ title, width, info }) => (
                          <Th key={title + 'column'} width={width} modifier='wrap' info={info}>
                            {title}
                          </Th>
                        ))}
                        {canWrite ? <Th screenReaderText='Row actions' /> : null}
                      </Tr>
                    </Thead>
                    <Tbody>
                      {activeTokens.map((token) => (
                        <Tr key={token.uuid}>
                          <Td dataLabel='Name'>{token.name}</Td>
                          <Td dataLabel='Prefix'>
                            <code>{token.token_prefix}…</code>
                          </Td>
                          <Td dataLabel='User'>{token.user_id}</Td>
                          <Td dataLabel='Expires'>{formatOptionalDate(token.expires_at)}</Td>
                          <Td dataLabel='Last used'>{formatOptionalDate(token.last_used_at)}</Td>
                          <Td dataLabel='Created'>{formatOptionalDate(token.created_at)}</Td>
                          {canWrite ? (
                            <Td dataLabel='Actions'>
                              <Button
                                variant='link'
                                isInline
                                ouiaId={`lightwell-revoke-token-${token.uuid}`}
                                onClick={() =>
                                  setTokenToRevoke({ uuid: token.uuid, name: token.name })
                                }
                              >
                                Revoke
                              </Button>
                            </Td>
                          ) : null}
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </Card>
              </Hide>

              <Hide hide={revokedTokens.length === 0}>
                <ExpandableSection
                  toggleText={
                    isRevokedExpanded
                      ? `Hide revoked tokens (${revokedTokens.length})`
                      : `Show revoked tokens (${revokedTokens.length})`
                  }
                  onToggle={(_event, expanded) => setIsRevokedExpanded(expanded)}
                  isExpanded={isRevokedExpanded}
                  displaySize='lg'
                  toggleId='lightwell-revoked-tokens-toggle'
                  contentId='lightwell-revoked-tokens-content'
                  data-ouia-component-id='lightwell-revoked-tokens-expand'
                >
                  <Card className={`${spacing.ptLg} ${spacing.pb_2xl} ${spacing.pxLg}`}>
                    <Table
                      aria-label='Revoked Lightwell access tokens table'
                      ouiaId='lightwell-revoked-tokens-table'
                      isStriped
                    >
                      <Thead>
                        <Tr>
                          {revokedColumnHeaders.map(({ title, width, info }) => (
                            <Th key={title + 'column'} width={width} modifier='wrap' info={info}>
                              {title}
                            </Th>
                          ))}
                        </Tr>
                      </Thead>
                      <Tbody>
                        {revokedTokens.map((token) => (
                          <Tr key={token.uuid}>
                            <Td dataLabel='Name'>{token.name}</Td>
                            <Td dataLabel='Prefix'>
                              <code>{token.token_prefix}…</code>
                            </Td>
                            <Td dataLabel='User'>{token.user_id}</Td>
                            <Td dataLabel='Expires'>{formatOptionalDate(token.expires_at)}</Td>
                            <Td dataLabel='Last used'>{formatOptionalDate(token.last_used_at)}</Td>
                            <Td dataLabel='Created'>{formatOptionalDate(token.created_at)}</Td>
                            <Td dataLabel='Revoked'>{formatOptionalDate(token.revoked_at)}</Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </Card>
                </ExpandableSection>
              </Hide>
            </Stack>
          </Hide>
        </Grid>
      </PageSection>

      {isCreateOpen ? <CreateTokenModal onClose={() => setIsCreateOpen(false)} /> : null}
      {tokenToRevoke ? (
        <RevokeTokenModal token={tokenToRevoke} onClose={() => setTokenToRevoke(null)} />
      ) : null}
    </>
  );
};

export default TokensTable;
