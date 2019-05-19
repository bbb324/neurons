/**
 * Created by razr on 2016/10/11.
 */
import React, { PureComponent } from 'react';
import tapOrClick from 'react-tap-or-click';
import languages from '../../../languages';
const OPTIONS = [{name: languages.getTranslation('dialog-pattern-mode-static'), value: 'static'},
  {name: languages.getTranslation('dialog-pattern-mode-roll'), value: 'roll'},
  {name: languages.getTranslation('dialog-pattern-mode-repeat'), value: 'repeat'},
  {name: languages.getTranslation('dialog-pattern-mode-marquee'), value: 'marquee'},
  {name: languages.getTranslation('dialog-pattern-mode-breathing'), value: 'breathing'},
  {name: languages.getTranslation('dialog-pattern-mode-gradient'), value: 'gradient'}];

class SelectMode extends PureComponent {
  constructor() {
    super(...arguments);
    this.state = {
      mode: this.props.mode
    };
  }
  renderOptions() {
    let select = this.state.mode;
    let opts = [];
    for( let i=0; i<OPTIONS.length; i++ ) {
      opts.push(
        <li key={i} className={OPTIONS[i].value==select?'icon-ok-2 selected-option':''} data-value={OPTIONS[i].value} {...tapOrClick(this.selectOption.bind(this))}>{OPTIONS[i].name}</li>
      );
    }
    return opts;
  }

  selectOption(e) {
    this.setState({
      mode: e.target.dataset.value
    });
  }

  render() {
    return (
      <div className={'mode-dialog-select'}>
        <ul className="mode-dialog-select-options">
          {this.renderOptions()}
        </ul>
      </div>
    );
  }
}

export { SelectMode };