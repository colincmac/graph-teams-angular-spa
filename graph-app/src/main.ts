import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';
import { allComponents, provideFluentDesignSystem } from '@fluentui/web-components';

if (environment.production) {
  enableProdMode();
}
provideFluentDesignSystem().register(allComponents);

platformBrowserDynamic()
  .bootstrapModule(AppModule)
  .catch((err) => console.error(err));
