import { Field, FieldProps } from "formik";
import * as React from "react";
import { ChangeEvent } from "react";
import {
  PlayerViewCustomStyles,
  PlayerViewSettings
} from "../../../common/PlayerViewSettings";
import { Button } from "../../Components/Button";
import { env } from "../../Environment";
import { StylesChooser } from "./StylesChooser";
import { Toggle } from "./Toggle";

export interface EpicInitiativeSettingsProps {
  playerViewSettings: PlayerViewSettings;
}

interface State {
  manualCSS: string;
}

export class EpicInitiativeSettings extends React.Component<
  EpicInitiativeSettingsProps,
  State
> {
  constructor(props: EpicInitiativeSettingsProps) {
    super(props);
    this.state = {
      manualCSS: this.props.playerViewSettings.CustomCSS
    };
  }

  public render() {
    if (!env.IsLoggedIn) {
      return this.loginMessage();
    }

    if (!env.HasEpicInitiative) {
      return this.upgradeMessage();
    }

    return (
      <div className="tab-content epicInitiative">
        <h3>Epic Initiative</h3>
        <p>
          <strong>Thank you for supporting Improved Initiative!</strong>
        </p>
        <h4>Player View Display Settings</h4>
        <Toggle fieldName="PlayerView.DisplayPortraits">
          Show combatant portraits
        </Toggle>
        <Toggle fieldName="PlayerView.SplashPortraits">
          Show turn start portrait splash
        </Toggle>
        <StylesChooser />
        <h4>Other Styles</h4>
        <Field name="PlayerView.CustomStyles.font">
          {(fieldProps: FieldProps) => (
            <p>
              <span style={{ fontFamily: fieldProps.field.value }}>Font:</span>{" "}
              <input {...fieldProps.field} />
            </p>
          )}
        </Field>

        <p>
          Background Image URL:{" "}
          <Field name="PlayerView.CustomStyles.backgroundUrl" />
        </p>

        <h4>
          Additional CSS <strong>(experimental)</strong>
        </h4>
        <Field component="textarea" rows={10} name="PlayerView.CustomCSS" />
      </div>
    );
  }

  private loginMessage = () => (
    <React.Fragment>
      <h3>Epic Initiative</h3>
      <p>
        Log in with Patreon to access patron benefits. Epic Initiative allows
        you to customize your Player View's appearance with combatant portraits,
        custom colors, fonts, and other CSS features.
      </p>
      <a className="login button" href={env.PatreonLoginUrl}>
        Log In with Patreon
      </a>
    </React.Fragment>
  );

  private upgradeMessage = () => (
    <React.Fragment>
      <h3>Epic Initiative</h3>
      <p>
        You're logged in with Patreon, but you have not selected the Epic
        Initiative reward level. Epic Initiative allows you to customize your
        "Player View's appearance with combatant portraits, custom colors,
        fonts, and other CSS features.
      </p>
      <Button
        onClick={() =>
          window.open(
            "https://www.patreon.com/bePatron?c=716070&rid=1937132",
            "_blank"
          )
        }
        additionalClassNames="button--upgrade"
        text="Pledge Now!"
      />
    </React.Fragment>
  );
}
