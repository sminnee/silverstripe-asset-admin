import $ from 'jQuery';
import React from 'react';
import ReactDOM from 'react-dom';
import SilverStripeComponent from 'silverstripe-component';
import ReactTestUtils from 'react-addons-test-utils';
import i18n from 'i18n';

export default class BulkActionsComponent extends SilverStripeComponent {

  constructor(props) {
    super(props);

    this.onChangeValue = this.onChangeValue.bind(this);
  }

  componentDidMount() {
    const $select = $(ReactDOM.findDOMNode(this)).find('.dropdown');

    $select.chosen({
      allow_single_deselect: true,
      disable_search_threshold: 20,
    });

    // Chosen stops the change event from reaching React so we have to simulate a click.
    $select.change(() => ReactTestUtils.Simulate.click($select.find(':selected')[0]));
  }

  render() {
    // eslint-disable-next-line arrow-body-style
    const children = this.props.options.map((option, i) => {
      return (<button
        type="button"
        className="gallery__bulk-actions_action font-icon-trash ss-ui-button ui-corner-all"
        key={i}
        onClick={this.onChangeValue}
        value={option.value}
      >
        {option.label}
      </button>);
    });

    return (
      <div className="gallery__bulk-actions fieldholder-small">
        <div className="gallery__bulk-actions__counter">{this.getSelectedFiles().length}</div>
        {children}
      </div>
    );
  }

  getOptionByValue(value) {
    // Using for loop because IE10 doesn't handle 'for of',
    // which gets transcompiled into a function which uses Symbol,
    // the thing IE10 dies on.
    for (let i = 0; i < this.props.options.length; i += 1) {
      if (this.props.options[i].value === value) {
        return this.props.options[i];
      }
    }

    return null;
  }

  getSelectedFiles() {
    return this.props.selectedFiles;
  }

  applyAction(value) {
    // We only have 'delete' right now...
    switch (value) {
      case 'delete':
        this.props.backend.delete(this.getSelectedFiles());
        break;
      default:
    }
  }

  onChangeValue(event) {
    const option = this.getOptionByValue(event.target.value);

    // Make sure a valid option has been selected.
    if (option === null) {
      return;
    }

    if (option.destructive === true) {
      // eslint-disable-next-line no-alert
      if (confirm(i18n.sprintf(i18n._t('AssetGalleryField.BULK_ACTIONS_CONFIRM'), option.label))) {
        this.applyAction(option.value);
      }
    } else {
      this.applyAction(option.value);
    }

    // Reset the dropdown to it's placeholder value.
    $(ReactDOM.findDOMNode(this)).find('.dropdown').val('').trigger('liszt:updated');
  }
}

BulkActionsComponent.propTypes = {
  selectedFiles: React.PropTypes.array.isRequired,
  options: React.PropTypes.array.isRequired,
  backend: React.PropTypes.object,
};
