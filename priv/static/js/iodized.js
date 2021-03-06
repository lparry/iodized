/** @jsx React.DOM */

var FeatureBox = React.createClass({

  getInitialState: function() {
    return {features: []};
  },

  componentWillMount: function() {
    this.refresh();
  },

  refresh: function() {
    this.props.featureRepo.fetchFeatures(function(featureData){
      this.setState({features: featureData});
    }.bind(this));
  },

  handleNewFeature: function() {
    this.newFeature();
    return false;
  },

  newFeature: function() {
    var emptyFeature = {
      title: "",
      description: "",
      master_switch_state: "dynamic"
    }
    this.refs.featureForm.show(emptyFeature, this.createFeature);
  },

  createFeature: function(feature) {
    this.props.featureRepo.createFeature(feature, this.refresh);
  },

  deleteFeature: function(feature) {
    if(confirm("really delete " + feature.title + "?")) {
      this.props.featureRepo.deleteFeature(feature, this.refresh);
    }
  },

  updateFeature: function(feature) {
    this.props.featureRepo.updateFeature(feature, this.refresh);
  },

  render: function() {
    return (
      <div className="featureBox">
        <h2>Features</h2>
          <div className="new-feature">
              <button type="button" className="btn new-feature__add" onClick={this.handleNewFeature} tabIndex="0">
                  <span className="glyphicon glyphicon-plus"></span>
              </button>
              <FeatureForm ref="featureForm"/>
          </div>

          <FeatureList features={this.state.features} updateFeature={this.updateFeature} deleteFeature={this.deleteFeature}/>
      </div>
    );
  }
});

var FeatureList = React.createClass({
  render: function() {
    var self = this;
    var featureNodes = this.props.features.map(function (feature, index) {
      return (
        <Feature key={index} feature={feature} editFeature={this.props.editFeature} deleteFeature={this.props.deleteFeature} updateFeature={this.props.updateFeature}/>
      )
    }.bind(this));
    return (
      <div className="featureList">{featureNodes}</div>
    );
  }
});

var Feature = React.createClass({
  getInitialState: function() {
    var editingFeature = $.extend({}, this.props.feature);
    return {editingFeature: editingFeature, expanded: false};
  },

  switchState: function (element) {
      if (element === 'checkbox') {
          switch (this.state.editingFeature.master_switch_state) {
              case "on":
              case "dynamic":
                  return true;
              case "off":
                  return false;
          }
      }
      else {
          var expanded_class = this.state.expanded ? "is-expanded" : "is-collapsed";
          switch (this.state.editingFeature.master_switch_state) {
              case "on":
              case "dynamic":
                  return 'feature--on ' + expanded_class;
              case "off":
                  return 'feature--off ' + expanded_class;
          }
      }
  },

  handleEdit: function(){
    this.setState({expanded: !this.state.expanded})
    return false;
  },

  handleToggle: function(e){
    var feature = this.state.editingFeature;
    if (e.target.checked) {
      feature.master_switch_state = feature.definition == null ? "on" : "dynamic";
    } else {
      feature.master_switch_state = "off";
    }
    this.setState({editingFeature: feature, exanded: false});
    this.props.updateFeature(this.state.editingFeature);
    return false;
  },

  handleUpdate: function () {
    this.props.updateFeature(this.state.editingFeature);
    this.handleEdit();
    return false;
  },

  handleDelete: function(){
    this.props.deleteFeature(this.state.editingFeature);
    false;
  },

  handleChange: function() {
    var feature = this.state.editingFeature;
    feature.title = this.refs.title.getDOMNode().value;
    feature.description = this.refs.description.getDOMNode().value;
    feature.master_switch_state = this.refs.master_switch_state.getDOMNode().value;
    feature.definition = null;
    this.setState({editingFeature: feature});
    return true;
  },

  render: function() {
    var feature = this.state.editingFeature;
    return(
      <div className={this.switchState('feature')}>
          <div className="feature__view">
              <a href="#" onClick={this.handleEdit} className="feature__view-edit-button"><span className="glyphicon glyphicon-pencil"></span></a>
              <div className="feature__view-content">
                  <h3>{feature.title}</h3>
                  <p>{feature.description}</p>
              </div>
              <div className="feature__switch">
                  <input type="checkbox" checked={this.switchState('checkbox')} className="js-switch" onChange={this.handleToggle}/>
              </div>
          </div>
          <div className="feature__edit">
              <form className="featureEditForm" ref="form" role="form">
                  <div className="form-group">
                      <label className="control-label" htmlFor="featureTitleInput">Feature Name*</label>
                      <input type="text" className="form-control input-lg" ref="title" id="featureTitleInput" value={feature.title} onChange={this.handleChange}/>
                      <small>Lower case and underscores only, no spaces</small>
                  </div>
                  <div className="form-group">
                      <label className="control-label" htmlFor="featureDescriptionInput">Description</label>
                      <textarea className="form-control input-lg" ref="description" rows="3" id="featureDescriptionInput" value={feature.description} onChange={this.handleChange}></textarea>
                      <small>A word or two on what the feature does so it can be easily identified if there are many active feature toggles on the page</small>
                  </div>
                  <div className="form-group">
                      <label htmlFor="featureMasterSwitchStateInput">Master Switch</label>
                      <select id="featureMasterSwitchStateInput" value={feature.master_switch_state} className="form-control" ref="master_switch_state" onChange={this.handleChange}>
                          <option value="dynamic">Dynamic</option>
                          <option value="on">On</option>
                          <option value="off">Off</option>
                      </select>
                  </div>
                  <button className="btn btn-delete" onClick={this.handleDelete} type="submit">Delete Feature</button>
                  <button className="btn btn-default btn-lg pull-right" onClick={this.handleUpdate} type="submit">Update Feature</button>
              </form>
          </div>
      </div>
    )
  }
});

var FeatureForm = React.createClass({
  getInitialState: function() {
    return {editingFeature: {}, dirty: false}
  },

  componentDidMount: function() {
    var self = this;
    var domNode = $(this.getDOMNode());
    domNode.on("hide.bs.modal", function(e) {
      if (this.state.dirty) {
        return false;
      }
    }.bind(this));
  },

  show: function(feature, onSave) {
    var editingFeature = $.extend({}, feature);
    this.setState({editingFeature: editingFeature, onSave: onSave, dirty: true}, function(){
        $('.new-feature')
            .toggleClass('is-expanded is-collapsed')
            .find("input:first-of-type").focus();
    }.bind(this));
  },

  handleChange: function() {
    var feature = this.state.editingFeature;
    feature.title = this.refs.title.getDOMNode().value;
    feature.description = this.refs.description.getDOMNode().value;
    feature.master_switch_state = this.refs.master_switch_state.getDOMNode().value;
    feature.definition = null;
    this.setState({editingFeature: feature});
    return true;
  },

  handleSaveFeature: function() {
    var feature = this.state.editingFeature;
    this.state.onSave(feature);
    this.setState({dirty: false}, function(){
        $('.new-feature').toggleClass('is-expanded is-collapsed');
    }.bind(this));
  },

  handleCancel: function() {
    this.setState({dirty: false}, function(){
      $('.new-feature').toggleClass('is-expanded is-collapsed');
        return false;
    }.bind(this));
  },

  render: function() {
    var feature = this.state.editingFeature;
    return (
        <div className="new-feature__content">
            <a href="#" onClick={this.handleCancel} className="new-feature__close">
                <span className="glyphicon glyphicon-remove"></span>
            </a>
            <form className="featureEditForm" ref="form" role="form">
                <div className="form-group">
                    <label className="control-label" htmlFor="featureTitleInput">Feature Name*</label>
                    <input type="text" className="form-control input-lg" ref="title" id="featureTitleInput" onChange={this.handleChange} />
                    <small>Lower case and underscores only, no spaces</small>
                </div>
                <div className="form-group">
                    <label className="control-label" htmlFor="featureDescriptionInput">Description</label>
                    <textarea className="form-control input-lg" ref="description" rows="3" id="featureDescriptionInput" onChange={this.handleChange}></textarea>
                    <small>A word or two on what the feature does so it can be easily identified if there are many active feature toggles on the page</small>
                </div>
                <div className="form-group">
                    <label htmlFor="featureMasterSwitchStateInput">Master Switch</label>
                    <select id="featureMasterSwitchStateInput" value={feature.master_switch_state} className="form-control" ref="master_switch_state" onChange={this.handleChange}>
                        <option value="dynamic">Dynamic</option>
                        <option value="on">On</option>
                        <option value="off">Off</option>
                    </select>
                </div>
                <button type="submit" className="btn btn-default btn-lg new-feature__submit" onClick={this.handleSaveFeature}>Add feature toggle</button>
            </form>
        </div>
//old:
//      <div className="featureEdit modal fade">
//        <div className="modal-dialog modal-lg">
//          <div className="modal-content">
//            <div className="modal-header">
//              <h3 className="modal-title">Add Feature</h3>
//            </div>
//            <div className="modal-body">
//              <form className="featureEditForm" ref="form" role="form">
//                <div className="form-group">
//                  <label>Feature title</label>
//                  <input id="featureTitleInput" className="form-control" type="text" ref="title" value={feature.title} onChange={this.handleChange}/>
//                </div>
//                <div className="form-group">
//                  <label for="featureDescriptionInput">Feature title</label>
//                  <textarea id="featureDescriptionInput" className="form-control" type="text" ref="description" value={feature.description} onChange={this.handleChange}/>
//                </div>
//                <div className="form-group">
//                  <label for="featureMasterSwitchStateInput">Master Switch</label>
//                  <select id="featureMasterSwitchStateInput" value={feature.master_switch_state} className="form-control" ref="master_switch_state" onChange={this.handleChange}>
//                    <option value="dynamic">Dynamic</option>
//                    <option value="on">On</option>
//                    <option value="off">Off</option>
//                  </select>
//                </div>
//              </form>
//            </div>
//            <div className="modal-footer">
//              <button type="button" className="btn" onClick={this.handleCancel}>Cancel</button>
//              <button type="button" className="btn btn-primary" onClick={this.handleSaveFeature}>Save</button>
//            </div>
//          </div>
//        </div>
//      </div>
    );
  }
});

var FeatureRepo = function(url){
  this.url = url;
};

FeatureRepo.prototype.fetchFeatures = function(onSuccess, onError){
  $.ajax({
    url: this.url,
    dataType: 'json',
    success: onSuccess,
    error: onError || function(xhr, status, err) {
      console.log(status, err);
    }
  });
};

FeatureRepo.prototype.createFeature = function(feature, onSuccess, onError){
  $.ajax({
    url: this.url,
    contentType: 'application/json',
    type: 'POST',
    data: JSON.stringify(feature),
    success: onSuccess,
    error: onError || function(xhr, status, err) {
      console.log(status, err);
    }
  });
}

FeatureRepo.prototype.updateFeature = function(feature, onSuccess, onError){
  $.ajax({
    url: this.url + "/" + feature.id,
    contentType: 'application/json',
    type: 'PUT',
    data: JSON.stringify(feature),
    error: onError || function(xhr, status, err) {
    success: onSuccess,
      console.log(status, err);
    }
  });
}

FeatureRepo.prototype.deleteFeature = function(feature, onSuccess, onError){
  $.ajax({
    url: this.url + "/" + feature.id,
    type: 'DELETE',
    success: onSuccess,
    error: onError || function(xhr, status, err) {
      console.log(status, err);
    }
  })
}

var featureRepo = new FeatureRepo("admin/api/features");
React.renderComponent(
  <FeatureBox featureRepo={featureRepo}/>,
  document.getElementById("iodized")
);

