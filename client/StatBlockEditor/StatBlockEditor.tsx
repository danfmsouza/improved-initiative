import { Field, FieldArray, Form, Formik, FormikProps } from "formik";
import * as React from "react";
import { StatBlock } from "../../common/StatBlock";
import { probablyUniqueString } from "../../common/Toolbox";
import { Button } from "../Components/Button";
import { Listing } from "../Library/Listing";
import { IdentityFields } from "./components/IdentityFields";
import { KeywordField } from "./components/KeywordField";
import { NameAndModifierField } from "./components/NameAndModifierField";
import { PowerField } from "./components/PowerField";
import { TextField } from "./components/TextField";

type FormApi = FormikProps<any>;

const AbilityNames = ["Str", "Dex", "Con", "Int", "Wis", "Cha"];

const valueAndNotesField = (label: string, fieldName: string) =>
    <label className="c-statblock-editor-text">
        <span className="label">{label}</span>
        <div className="inline">
            <Field type="number" className="value" name={`${fieldName}.Value`} />
            <Field type="text" className="notes" name={`${fieldName}.Notes`} />
        </div>
    </label>;

const initiativeField = () =>
    <div className="c-statblock-editor-text">
        <label className="label" htmlFor="InitiativeModifier">Initiative Modifier</label>
        <div className="inline">
            <Field type="number" className="value" id="InitiativeModifier" name="InitiativeModifier" />
            <label> Roll with Advantage
                <Field type="checkbox" name="InitiativeAdvantage" />
            </label>
        </div>
    </div>;

const abilityScoreField = (abilityName: string) =>
    <div key={abilityName} className="c-statblock-editor-ability">
        <label htmlFor={`ability-${abilityName}`}>{abilityName}</label>
        <Field type="number" id={`ability-${abilityName}`} name={`Abilities.${abilityName}`} />
    </div>;

const nameAndModifierFields = (api: FormApi, modifierType: string) => {
    return <FieldArray name={modifierType} render={arrayHelpers => {

        const addButton = <button
            type="button"
            className="fa fa-plus c-add-button"
            onClick={() => arrayHelpers.push({ Name: "", Modifier: "" })} />;

        if (api.values[modifierType].length == 0) {
            return <div>
                <span className="label">
                    {modifierType}
                    {addButton}
                </span>
            </div>;
        } else {
            return <div>
                <span className="label">{modifierType}</span>
                <div className="inline-names-and-modifiers">
                    {api.values[modifierType].map((_, i: number) =>
                        <NameAndModifierField key={i} remove={arrayHelpers.remove} modifierType={modifierType} index={i} />
                    )}
                </div>
                {addButton}
            </div>;
        }
    }} />;
};

const keywordFields = (api: FormApi, keywordType: string) => {
    return <FieldArray name={keywordType} render={arrayHelpers => {
        const addButton = <button
            type="button"
            className="fa fa-plus c-add-button"
            onClick={() => arrayHelpers.push("")} />;

        if (api.values[keywordType].length == 0) {
            return <div>
                <span className="label">
                    {keywordType}
                    {addButton}
                </span>
            </div>;
        } else {
            return <div>
                <span className="label">{keywordType}</span>
                {api.values[keywordType].map((_, i: number) =>
                    <KeywordField key={i} remove={arrayHelpers.remove} keywordType={keywordType} index={i} />)}
                {addButton}
            </div>;
        }
    }} />;
};

const powerFields = (api: FormApi, powerType: string) => {
    return <FieldArray name={powerType} render={arrayHelpers => {

        const addButton = <button type="button"
            className="fa fa-plus c-add-button"
            onClick={() => arrayHelpers.push({ Name: "", Content: "", Usage: "" })} />;

        if (api.values[powerType].length == 0) {
            return <div>
                <span className="label">
                    {powerType}
                    {addButton}
                </span>
            </div>;
        } else {
            return <div>
                <div className="label">{powerType}</div>
                <div className="inline-powers">
                    {api.values[powerType].map((_, i: number) =>
                        <PowerField key={i} remove={arrayHelpers.remove} powerType={powerType} index={i} />)}
                </div>
                {addButton}
            </div>;
        }
    }} />;
};

const descriptionField = () =>
    <label className="c-statblock-editor-text">
        <div className="label">Description</div>
        <Field component="textarea" name="Description" />
    </label>;

export class StatBlockEditor extends React.Component<StatBlockEditorProps, StatBlockEditorState> {
    private parseIntWhereNeeded = (submittedValues: StatBlock) => {
        AbilityNames.forEach(a => submittedValues.Abilities[a] = parseInt(submittedValues.Abilities[a].toString(), 10));
        submittedValues.HP.Value = parseInt(submittedValues.HP.Value.toString(), 10);
        submittedValues.AC.Value = parseInt(submittedValues.AC.Value.toString(), 10);
        submittedValues.InitiativeModifier = parseInt(submittedValues.InitiativeModifier.toString(), 10);
        submittedValues.Skills.forEach(s => s.Modifier = parseInt(s.Modifier.toString(), 10));
        submittedValues.Saves.forEach(s => s.Modifier = parseInt(s.Modifier.toString(), 10));
    }

    public saveAndClose = (submittedValues) => {
        const saveAs = submittedValues.SaveAs;
        if (saveAs) {
            submittedValues.Id = probablyUniqueString();
            delete submittedValues.SaveAs;
        }

        this.parseIntWhereNeeded(submittedValues);
        const editedStatBlock = {
            ...StatBlock.Default(),
            ...this.props.statBlock,
            ...submittedValues,
        };

        if (saveAs && this.props.onSaveAs) {
            this.props.onSaveAs(editedStatBlock);
        } else {
            this.props.onSave(editedStatBlock);
        }
        this.props.onClose();
    }

    private close = () => {
        this.props.onClose();
    }

    private delete = () => {
        this.props.onDelete();
        this.props.onClose();
    }

    public render() {
        const header =
            this.props.editMode == "combatant" ? "Edit Combatant Statblock" :
                this.props.editMode == "library" ? "Edit Library Statblock" :
                    "Edit StatBlock";

        const challengeLabel = this.props.statBlock.Player == "player" ? "Level" : "Challenge";

        return <Formik
            onSubmit={this.saveAndClose}
            initialValues={this.props.statBlock}
            render={api => (
                <Form className="c-statblock-editor" autoComplete="false">
                    <h2>{header}</h2>
                    <div className="scrollframe">
                        <div className="bordered c-statblock-editor-identity">
                            <IdentityFields
                                hasFolder={api.values["Path"] && api.values["Path"].length > 0}
                                allowFolder={this.props.editMode === "library"}
                                setFolder={folderName => api.setFieldValue("Path", folderName)}
                                allowSaveAs={this.props.onSaveAs !== undefined && (api.touched["Name"] == true || api.touched["Path"] == true)}
                                currentListings={this.props.currentListings}
                            />
                        </div>
                        <div className="bordered c-statblock-editor-headers">
                            <TextField label="Portrait URL" fieldName="ImageURL" />
                            <TextField label="Source" fieldName="Source" />
                            <TextField label="Type" fieldName="Type" />
                        </div>
                        <div className="bordered c-statblock-editor-stats">
                            <TextField label={challengeLabel} fieldName="Challenge" />
                            {valueAndNotesField("Hit Points", "HP")}
                            {valueAndNotesField("Armor Class", "AC")}
                            {initiativeField()}
                        </div>
                        <div className="bordered c-statblock-editor-abilityscores">
                            {AbilityNames
                                .map(abilityScoreField)}
                        </div>
                        <div className="bordered c-statblock-editor-saves">
                            {nameAndModifierFields(api, "Saves")}
                        </div>
                        <div className="bordered c-statblock-editor-skills">
                            {nameAndModifierFields(api, "Skills")}
                        </div>
                        {["Speed", "Senses", "DamageVulnerabilities", "DamageResistances", "DamageImmunities", "ConditionImmunities", "Languages"]
                            .map(
                                keywordType =>
                                    <div key={keywordType} className="bordered c-statblock-editor-keywords">
                                        {keywordFields(api, keywordType)}
                                    </div>
                            )}
                        {["Traits", "Actions", "Reactions", "LegendaryActions"].map(
                            powerType =>
                                <div key={powerType} className="bordered c-statblock-editor-powers">
                                    {powerFields(api, powerType)}
                                </div>
                        )}
                        <div className="bordered c-statblock-editor-description">
                            {descriptionField()}
                        </div>

                    </div>
                    <div className="c-statblock-editor-buttons">
                        <Button onClick={this.close} faClass="times" />
                        {this.props.onDelete && <Button onClick={this.delete} faClass="trash" />}
                        <button type="submit" className="button fa fa-save" />
                    </div>
                </Form>
            )} />;
    }
}

interface StatBlockEditorProps {
    statBlock: StatBlock;
    onSave: (statBlock: StatBlock) => void;
    onDelete?: () => void;
    onSaveAs?: (statBlock: StatBlock) => void;
    onClose: () => void;
    editMode: "library" | "combatant";
    currentListings?: Listing<StatBlock> [];
}

interface StatBlockEditorState { }