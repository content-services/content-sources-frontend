import { ConnectSnippetTab } from '../../Repositories/components/connectSnippets';

interface PackageCoordinate {
  group: string;
  name: string;
  release: string;
  sourceUrl: string;
}

export const getPackageDependencySnippetTabs = (pkg: PackageCoordinate): ConnectSnippetTab[] => [
  {
    eventKey: 'maven',
    title: 'Maven',
    snippets: [
      {
        label: 'Add to your pom.xml:',
        code: `<!-- Source: ${pkg.sourceUrl} -->
<dependency>
  <groupId>${pkg.group}</groupId>
  <artifactId>${pkg.name}</artifactId>
  <version>${pkg.release}</version>
</dependency>`,
      },
    ],
  },
  {
    eventKey: 'gradle',
    title: 'Gradle',
    snippets: [
      {
        label: 'Add to your build.gradle:',
        code: `// Source: ${pkg.sourceUrl}
implementation("${pkg.group}:${pkg.name}:${pkg.release}")`,
      },
    ],
  },
];
