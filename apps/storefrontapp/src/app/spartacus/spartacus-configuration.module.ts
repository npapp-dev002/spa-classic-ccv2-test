import { NgModule } from '@angular/core';
import { translationChunksConfig, translationsEn } from "@spartacus/assets";
import { FeaturesConfig, I18nConfig, provideConfig, provideConfigFactory, SiteContextConfig } from "@spartacus/core";
import { defaultCmsContentProviders, layoutConfigFactory, mediaConfig } from "@spartacus/storefront";

@NgModule({
  declarations: [],
  imports: [
  ],
  providers: [provideConfigFactory(layoutConfigFactory), provideConfig(mediaConfig), ...defaultCmsContentProviders, provideConfig(<SiteContextConfig>{
    context: {},
  }), provideConfig(<I18nConfig>{
    i18n: {
      resources: { en: translationsEn },
      chunks: translationChunksConfig,
      fallbackLang: 'en'
    },
  }), provideConfig(<FeaturesConfig>{
    features: {
      level: '221121.13'
    }
  })]
})
export class SpartacusConfigurationModule { }
