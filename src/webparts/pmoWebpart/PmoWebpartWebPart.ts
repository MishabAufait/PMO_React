import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { App } from '../../App';
import { spfi, SPFx } from "@pnp/sp";
import { IAppProps } from '../../IAppProps';
import { SPComponentLoader } from '@microsoft/sp-loader';
import { initializeIcons } from '@fluentui/react/lib/Icons';
import { dev_css_url } from '../../utils/constants';


export interface IErmsMainWebPartProps {
  description: string;
}

export default class ErmsMainWebPart extends BaseClientSideWebPart<IErmsMainWebPartProps> {

  private _sp: ReturnType<typeof spfi>;

  public onInit(): Promise<void> {
    // ✅ Set favicon
    const head = document.getElementsByTagName("head")[0];
    const link = document.createElement("link");
    link.rel = "icon";
    link.type = "image/x-icon";
    // link.href = `${defaultTenantUrl}/sites/${Site_Name}/SiteAssets/favicon.ico`;
    head.appendChild(link);

    return super.onInit().then(_ => {
      // ✅ Initialize Fluent UI icons
      initializeIcons();

      // ✅ Load Google Outfit font
      SPComponentLoader.loadCss("https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap");

      // ✅ Load custom dev CSS
      SPComponentLoader.loadCss(`${this.context.pageContext.site.absoluteUrl}${dev_css_url}`);

      // ✅ Setup PnPjs with SPFx context
      this._sp = spfi().using(SPFx(this.context));
    });
  }

  public render(): void {
    try {
      const element: React.ReactElement<IAppProps> = React.createElement(App, {
        sp: this._sp,
        context: this.context
      });

      ReactDom.render(element, this.domElement);
    } catch (error: any) {
      console.error('Error rendering web part:', error);
      this.domElement.innerHTML = `
        <div style="padding: 20px; border: 1px solid #dc3545; background: #f8d7da; color: #721c24; border-radius: 4px;">
          <h3>Web Part Loading Error</h3>
          <p>There was an issue loading the web part content.</p>
          <small>Error: ${error.message || 'Unknown error occurred'}</small>
        </div>
      `;
    }
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }
}
