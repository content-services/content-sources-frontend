import {
    ClipboardCopy,
    ClipboardCopyVariant,
    TabContent,
    Text, TextContent,
    TextList,
    TextListItem,
    TextVariants
} from '@patternfly/react-core';
import React from 'react';
import {ADD_ROUTE, DETAILS_ROUTE, SYSTEMS_ROUTE} from '../../../../../Routes/constants';
import {ExternalLinkAltIcon} from '@patternfly/react-icons';
import {createUseStyles} from 'react-jss';
import {useLocation} from 'react-router-dom';

export const INSIGHTS_TAB = 'insights'

const useStyles = createUseStyles({
    textGroup: {
        paddingTop: '8px',
    },
})

type Props = {
    tabContentRef:  React.RefObject<HTMLElement>
}

const InsightsTab = ({ tabContentRef }: Props) => {
    const classes = useStyles();

    const { pathname } = useLocation();
    const [mainRoute] = pathname?.split(`${DETAILS_ROUTE}/`) || [];
    const addSystemsRoute = mainRoute + `${DETAILS_ROUTE}/`+ `${SYSTEMS_ROUTE}/` + `${ADD_ROUTE}/`;

    return (
        <TabContent eventKey={INSIGHTS_TAB} id={INSIGHTS_TAB} ref={tabContentRef}>
            <TextContent className={classes.textGroup}>
                <Text component={TextVariants.h2}>Register for subscriptions</Text>
                <TextList isPlain>
                    <TextListItem>
                        <Text component="h6">Register with rhc</Text>
                        <ClipboardCopy isReadOnly hoverTip="Copy" clickTip="Copied" variant={ClipboardCopyVariant.expansion}>
                            rhc connect
                        </ClipboardCopy>
                    </TextListItem>
                </TextList>
                <Text component={TextVariants.h2}>Assign the template to a system</Text>
                <TextList isPlain>
                    <TextListItem>
                        <Text>
                            Add template in {' '}
                            <a href={addSystemsRoute} rel='noreferrer' target='_blank'>
                                Systems <ExternalLinkAltIcon/>
                            </a>
                        </Text>
                    </TextListItem>
                </TextList>
            </TextContent>
        </TabContent>
    )
}

export default InsightsTab;
