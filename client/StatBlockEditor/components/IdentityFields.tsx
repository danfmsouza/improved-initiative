import Awesomplete = require("awesomplete");
import { Field } from "formik";
import _ = require("lodash");
import * as React from "react";
import { StatBlock } from "../../../common/StatBlock";
import { Listing } from "../../Library/Listing";

interface IdentityFieldsProps {
    hasFolder: boolean;
    allowFolder: boolean;
    setFolder: (folderName: string) => void;
    allowSaveAs: boolean;
    currentListings?: Listing<StatBlock>[];
}

interface IdentityFieldsState {
    folderExpanded: boolean;
}

export class IdentityFields extends React.Component<IdentityFieldsProps, IdentityFieldsState> {
    private folderInput: HTMLInputElement;
    private autoCompletePaths: string [];
    private initializedAutocomplete = false;

    constructor(props) {
        super(props);
        this.autoCompletePaths = _.uniq(this.props.currentListings && this.props.currentListings.map(l => l.Path));
        
        this.state = {
            folderExpanded: this.props.hasFolder
        };
    }

    private folderElement = () => {
        if (!this.props.allowFolder) {
            return null;
        }
        if (this.state.folderExpanded) {
            return <div>
                <label className="label" htmlFor="Path">Folder</label>
                <Field type="text" name="Path"  innerRef={i => this.folderInput = i} />
            </div>;
        } else {
            return <span className="fa-clickable fa-folder" onClick={() => this.setState({ folderExpanded: true })} />;
        }
    }

    public componentDidUpdate() {
        if (!this.folderInput || this.initializedAutocomplete) {
            return;
        }
        
        new Awesomplete(this.folderInput, {
            list: this.autoCompletePaths,
            minChars: 1
        });

        this.folderInput.addEventListener("awesomplete-selectcomplete", (event: any) => {
            this.props.setFolder(event.text.value);
        });

        this.initializedAutocomplete = true;
    }

    public render() {
        return <React.Fragment>
            <div className="inline">
                {this.folderElement()}
                <div>
                    <label className="label" htmlFor="Name">Name</label>
                    <Field type="text" name="Name" id="name" />
                </div>
            </div>
            {this.props.allowSaveAs && <label>Save as a copy <Field type="checkbox" name="SaveAs" /></label>}
        </React.Fragment>;
    }
}