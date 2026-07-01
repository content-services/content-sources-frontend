import { ContentItem } from 'services/Content/ContentApi';

export interface ConnectCodeSnippet {
  label: string;
  code: string;
  urlOnly?: boolean;
  description?: string;
}

export interface ConnectSnippetTab {
  eventKey: string;
  title: string;
  snippets: ConnectCodeSnippet[];
}

type RepositoryContext = Pick<ContentItem, 'name' | 'published_distribution_url' | 'content_type'>;

const getMavenSnippetTabs = (repository: RepositoryContext): ConnectSnippetTab[] => {
  const { name, published_distribution_url } = repository;

  return [
    {
      eventKey: 'maven',
      title: 'Maven',
      snippets: [
        {
          label: 'Add to your settings.xml or pom.xml:',
          code: `<repository>
  <id>${name}</id>
  <url>${published_distribution_url}</url>
</repository>`,
        },
      ],
    },
    {
      eventKey: 'gradle',
      title: 'Gradle',
      snippets: [
        {
          label: 'Add to your build gradle:',
          code: `repositories {
    maven {
        url "${published_distribution_url}"
    }
}`,
        },
      ],
    },
    {
      eventKey: 'artifactory',
      title: 'Artifactory',
      snippets: [
        {
          label: 'Configure as a remote repository in Artifactory:',
          code: published_distribution_url ? published_distribution_url : '',
          urlOnly: true,
          description:
            'Set the remote URL to this endpoint. Artifactory will proxy and cache packages automatically.',
        },
      ],
    },
  ];
};

const getPythonSnippetTabs = (repository: RepositoryContext): ConnectSnippetTab[] => {
  const { published_distribution_url } = repository;

  return [
    {
      eventKey: 'pip',
      title: 'pip',
      snippets: [
        {
          label: 'Install directly:',
          code: `pip install --index-url ${published_distribution_url} <package>`,
        },
      ],
    },
    {
      eventKey: 'pip.conf',
      title: 'pip.conf',
      snippets: [
        {
          label: 'Add to your pip.conf for permanent use:',
          code: `[global] index-url = ${published_distribution_url}`,
        },
      ],
    },
    {
      eventKey: 'artifactory',
      title: 'Artifactory',
      snippets: [
        {
          label: 'Configure as a remote repository in Artifactory:',
          code: published_distribution_url ? published_distribution_url : '',
          urlOnly: true,
          description:
            'Set the remote URL to this endpoint. Artifactory will proxy and cache packages automatically.',
        },
      ],
    },
  ];
};

export const getConnectSnippetTabs = (repository: RepositoryContext): ConnectSnippetTab[] => {
  const contentType = repository.content_type?.trim().toLowerCase();

  if (contentType === 'maven') {
    return getMavenSnippetTabs(repository);
  }

  return getPythonSnippetTabs(repository);
};
