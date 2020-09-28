import * as React from 'react';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { IPropertyFieldNumberHostProps, IPropertyFieldNumberHostState } from './IPropertyFieldNumberHost';
import * as telemetry from '../../common/telemetry';
import { Async } from 'office-ui-fabric-react/lib/Utilities';
import * as strings from 'PropertyControlStrings';
import { GeneralHelper } from '../../helpers/GeneralHelper';

export default class PropertyFieldNumberHost extends React.Component<IPropertyFieldNumberHostProps, IPropertyFieldNumberHostState> {
  private _async: Async;
  private _delayedChange: (value: string) => void;

  constructor(props: IPropertyFieldNumberHostProps) {
    super(props);

    telemetry.track('PropertyFieldNumber', {
      disabled: props.disabled
    });

    this.state = {
      value: this.props.value ? this.props.value.toString() : null
    };

    this._async = new Async(this);
    this._delayedChange = this._async.debounce(this._onChanged, this.props.deferredValidationTime ? this.props.deferredValidationTime : 200);
  }

  /**
   * componentDidUpdate lifecycle hook
   *
   * @param prevProps
   * @param prevState
   */
  public componentDidUpdate(prevProps: IPropertyFieldNumberHostProps, prevState: IPropertyFieldNumberHostState): void {
    if (prevProps.value !== this.props.value) {
      this.setState({
        value: GeneralHelper.isDefined(this.props.value) ? this.props.value.toString() : null
      });
    }
  }

  /**
   * Validate if field value is a number
   * @param value
   */
  private _validateNumber = (value: string): string | Promise<string> => {
    const nrValue = parseInt(value);

    if (isNaN(nrValue)) {
      return `${strings.NotNumberValidationMessage} ${value}.`;
    }

    const {
      minValue,
      maxValue
    } = this.props;

    // Check if number is lower or equal to minimum value
    if (GeneralHelper.isDefined(minValue) && nrValue < minValue) {
      return `${strings.MinimumNumberValidationMessage} ${minValue}`;
    }
    // Check if the number is greater than the maximum value
    if (GeneralHelper.isDefined(maxValue) && nrValue > maxValue) {
      return `${strings.MaximumNumberValidationMessage} ${maxValue}`;
    }

    if (this.props.onGetErrorMessage) {
      return this.props.onGetErrorMessage(nrValue);
    } else {
      return '';
    }
  }

  /**
   * On field change event handler
   */
  private _onChanged = (value: string): void => {
    // Update state
    this.setState({
      value
    });

    const {
      minValue,
      maxValue
    } = this.props;

    const nrValue = parseInt(value);
    if (!isNaN(nrValue)) {
      if ((!GeneralHelper.isDefined(minValue) || nrValue >= minValue) && (!GeneralHelper.isDefined(maxValue) || nrValue <= maxValue)) {
        // Trigger change for the web part
        this.props.onChanged(nrValue);
      }
    }
    else {
      this.props.onChanged(undefined);
    }
  }

  /**
   * Render field
   */
  public render(): JSX.Element {
    return (
      <div>
        <TextField label={this.props.label}
                   ariaLabel={this.props.ariaLabel}
                   onChanged={this._delayedChange}
                   value={this.state.value}
                   description={this.props.description}
                   placeholder={this.props.placeholder}
                   errorMessage={this.props.errorMessage}
                   onGetErrorMessage={this._validateNumber}
                   deferredValidationTime={this.props.deferredValidationTime}
                   disabled={this.props.disabled} />
      </div>
    );
  }
}