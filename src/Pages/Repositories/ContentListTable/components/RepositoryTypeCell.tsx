import { ContentOrigin } from '../../../../services/Content/ContentApi';
import TypeLabel from 'components/RepositoryLabels/TypeLabel/TypeLabel';

type RepositoryTypeCellProps = {
  origin: ContentOrigin | undefined;
  partner: boolean | undefined;
  isPartnerAdmin: boolean;
};

const RepositoryTypeCell = ({ origin, partner, isPartnerAdmin }: RepositoryTypeCellProps) => {
  switch (origin) {
    case ContentOrigin.REDHAT:
      return <TypeLabel type='redHat' />;
    case ContentOrigin.EXTERNAL:
      return <TypeLabel type='remote' />;
    case ContentOrigin.COMMUNITY:
      return <TypeLabel type='partner' />;
    case ContentOrigin.UPLOAD:
      // Uploaded repos appear as origin=upload for partner-admins and origin=community for other orgs
      // Currently only upload-based custom repos are supported for partner-admins (remotes may come later)
      return <TypeLabel type='upload' hideTooltip={!!partner && isPartnerAdmin} />;
    default:
      return null;
  }
};

export default RepositoryTypeCell;
