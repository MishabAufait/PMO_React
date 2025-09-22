import * as React from 'react';
import styles from './PmoWebpart.module.scss';
import type { IPmoWebpartProps } from './IPmoWebpartProps';
import { App } from '../../../App';

export default class PmoWebpart extends React.Component<IPmoWebpartProps> {
  public render(): React.ReactElement<IPmoWebpartProps> {
    const { description, isDarkTheme, environmentMessage, hasTeamsContext, userDisplayName } = this.props;

    return (
      <section className={`${styles.pmoWebpart} ${hasTeamsContext ? styles.teams : ''}`}>
        <App sp={{}} context={{ description, isDarkTheme, environmentMessage, userDisplayName }} />
      </section>
    );
  }
}
