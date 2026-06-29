import { ApplicationConfig, importProvidersFrom, mergeApplicationConfig } from '@angular/core';
import { appConfig } from './app.config';
import { AppServerModule } from "./app.module.server";

const serverConfig: ApplicationConfig = {
  providers: [
    importProvidersFrom(AppServerModule)
  ]
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
