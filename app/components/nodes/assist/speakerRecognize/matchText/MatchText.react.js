/**
 * Created by shenghuowang on 17/3/30.
 */
import React, { PureComponent } from 'react';
import {Inputs, Outputs, Tools} from '../../../Node.react';
import languages from '../../../../../languages';
//import { Configurator } from '../../../../configurator/Configurator.react';
//import { SoundStyle } from '../../../../configurator/configStyle';
import UIActions from '../../../../../actions/UIActions';
require('./MatchText.less');

class MatchTextNode extends PureComponent {
  constructor() {
    super(...arguments);
  }

  renderPreview() {
    return (
      <div className={'node-preview node-preview-palette node-type-' + this.props.info.name} data-type={this.props.info.name} data-category={this.props.info.props.category}>
        <img className="node-preview-icon" src='./img/icon-matchText.png' />
        <span className="node-preview-name">{languages.getTranslation('assistance-node-matchText')}</span>
      </div>
    );
  }

  renderActual() {
    return (
      <div className={'node-actual node-type-' + this.props.info.name} id={this.props.id} style={{
        left: this.props.left + 'px',
        top: this.props.top + 'px'
      }} data-type={this.props.info.name} data-category={this.props.info.props.category}>
        <div className='node-body node-draggable' style={{
          backgroundImage: 'url("img/sound-matchText.png")'}}>
        </div>
        <Inputs ports={this.props.info.props.in} nodeId={this.props.id} />
        <Outputs ports={this.props.info.props.out} nodeId={this.props.id} showValue={true}/>
        {/*<Configurator
          title={languages.getTranslation('find-text')}
          nodeId={this.props.id}
          type={this.props.info.name}
          bodyStyle={SoundStyle.MATCHTEXT}/> */}
        <Tools nodeId={this.props.id} />
      </div>
    );
  }

  render() {
    return this.props.isPreview ? this.renderPreview() : this.renderActual();
  }

  componentDidMount() {
    if(this.props.id) {
      UIActions.initConfig(this.props.id, false);
    }

  }
}

export { MatchTextNode };
