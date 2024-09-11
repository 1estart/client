import type {NavigationData, PageContent} from '@gravity-ui/page-constructor';
import type {ReactElement} from 'react';
import type {Props as HeaderControlsProps} from '../HeaderControls';

import React, {useEffect} from 'react';
import {ThemeProvider} from '@gravity-ui/uikit';
import {
    ConsentPopup,
    DocBasePageData,
    DocContentPageData as DocContentPageDataBase,
    DocLeadingPageData,
    DocPageData,
    Lang,
    Router,
    configure,
} from '@diplodoc/components';
import '@diplodoc/transform/dist/js/yfm';

import {getDirection, updateRootClassName, updateThemeClassName} from '../../utils';
import {LangProvider} from '../../hooks/useLang';
import '../../interceptors/leading-page-links';
import '../../interceptors/fast-class-applier';

import {LegacyNavPage, RichNavPage} from './Page';
import {Runtime} from './Runtime';
import {useLangs} from './useLangs';
import {useSettings} from './useSettings';
import {useMobile} from './useMobile';
import './App.scss';

export type DocAnalytics = {
    gtm?: {
        id?: string;
        mode?: 'base' | 'notification';
    };
};

export interface AppProps {
    lang: Lang;
    langs: Lang[];
    router: Router;
    analytics?: DocAnalytics;
}

export type WithNavigation = {
    navigation: NavigationData;
};

export type DocContentPageData = DocContentPageDataBase<PageContent>;

export type PageData = DocPageData | DocLeadingPageData | DocContentPageData;

export type DocInnerProps<Data extends PageData = PageData> = {
    data: Data;
} & AppProps;

export type {DocLeadingPageData, DocPageData};

function hasNavigation(
    data: DocBasePageData<Partial<WithNavigation>>,
): data is DocBasePageData<WithNavigation> {
    return Boolean(data.toc.navigation);
}

export function App(props: DocInnerProps): ReactElement {
    const {data, router, lang, analytics} = props;

    configure({
        lang,
    });

    const settings = useSettings();
    const langs = useLangs(props);
    const mobileView = useMobile();

    const {theme, textSize, wideFormat, fullScreen, showMiniToc} = settings;

    const page = {
        router,

        theme,
        textSize,
        wideFormat,
        fullScreen,
        showMiniToc,
    };
    const controls: HeaderControlsProps = {
        ...settings,
        ...langs,
        mobileView,
    };
    const direction = getDirection(lang);

    useEffect(() => {
        updateRootClassName({mobileView, wideFormat, fullScreen});
        updateThemeClassName({theme});
    }, [theme, mobileView, wideFormat, fullScreen]);

    return (
        <div className="App">
            <ThemeProvider theme={theme} direction={direction}>
                <LangProvider value={lang}>
                    {hasNavigation(data) ? (
                        <RichNavPage data={data} props={page} controls={controls} />
                    ) : (
                        <LegacyNavPage data={data} props={page} controls={controls} />
                    )}
                    {analytics && (
                        <ConsentPopup
                            router={router}
                            gtmId={analytics?.gtm?.id || ''}
                            consentMode={analytics?.gtm?.mode}
                        />
                    )}
                    <Runtime />
                </LangProvider>
            </ThemeProvider>
        </div>
    );
}
