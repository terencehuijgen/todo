
var notepad = {
  notes: [],
  selectedId: null,
};

var onLoadNotes = function(data){
  notepad.notes = data;
  onChange();
};

var onSelectNote = function(id){
  notepad.selectedId = id;
  onChange();
}

var nextNodeId = 24235345634;


var onAddNote = function(){
  var note = {id: nextNodeId, content: ''};
  nextNodeId++;
  notepad.notes.push(note);
  notepad.selectedId = note.id;
  console.log(note);
  console.log(notepad.notes[1]);

  $.ajax({
    url: "/todos.json",
    dataType: 'json',
    type: 'POST',
    data: { todo: note },
    success: function() {
      console.log("posting done")
      //notepad.notes = data;
    },
    error: function(xhr, status, err) {
      console.error("/todos.json", status, err.toString());
    }
  });

  onChange();
};

var onChangeNote = function(id, value) {
  var note = _.find(notepad.notes, function(note) {
    return note.id === id;
  });
  if (note){
    note.content = value;
  }

  $.ajax({
    url: "/todos/" + note.id + ".json",
    dataType: 'json',
    type: 'PUT',
    data: { todo: note },
    success: function() {
      console.log("posting done")
      //notepad.notes = data;
    },
    error: function(xhr, status, err) {
      console.error("/todos.json", status, err.toString());
    }
  });

  onChange();
};

var onDeleteNote = function(id){
  var note = _.find(notepad.notes, function(note) {
    return note.id === id;
  });
  if (note) {
    notepad.notes = notepad.notes.filter(function(note) {
      return note.id !== id;
    });
  }
  if (notepad.selectedId === id){
    notepad.selectedId = null;
  }

  $.ajax({
    url: "/todos/" + note.id + ".json",
    dataType: 'json',
    type: 'DELETE',
    data: { todo: note },
    success: function() {
      console.log("posting done")
      //notepad.notes = data;
    },
    error: function(xhr, status, err) {
      console.error("/todos.json", status, err.toString());
    }
  });


  onChange();
};

// var NoteEditor = React.createClass({
//   getInitialState: function(){
//     return {
//       isConfirming: false
//     };
//   },
//   onChange: function(event){
//     this.props.onChange(this.props.note.id, event.target.value);
//   },
//   onDelete: function(){
//     if(this.state.isConfirming){
//       this.props.onDelete(this.props.note.id);
//       this.setState({isConfirming: false});
//     } else {
//       this.setState({isConfirming: true});
//     }
//   },
//   onCancelDelete: function() {
//     this.setState({isConfirming: false});
//   },
//   render: function(){
//     return (
//       <div>
//         <input value={this.props.note.content} onChange={this.onChange} />
//         <div>
//         {this.state.isConfirming ?
//           <div><Pulse>
//           <button className="deleteButton" onClick={this.onDelete}>Confirm</button>
//           </Pulse>
//           <button onClick={this.onCancelDelete}>Cancel</button></div> :
//           <button onClick={this.onDelete}>Delete note</button>
//         }
//         </div>
//       </div>
//     );
//   }
// });
//<div>{notepad.selectedId === note.id ? <input className="todo-input" value={note.content} onChange={this.onChange} /> : <div className="note-summary">{title}</div>}</div>
var NoteSummary = React.createClass({
  getInitialState: function(){
    return {
      isConfirming: false
    };
  },
  onDelete: function(){
    if(this.state.isConfirming){
      this.props.onDelete(this.props.note.id);
      this.setState({isConfirming: false});
    } else {
      this.setState({isConfirming: true});
    }
  },
  onCancelDelete: function() {
    this.setState({isConfirming: false});
  },
  onChange: function(event){
    this.props.onChange(this.props.note.id, event.target.value);
  },
  render: function(){
    var note = this.props.note;
    var notepad = this.props.notepad;
    // var title = note.content.substring(0, note.content.indexOf('\n'));
    // title = title || note.content;
    var title = note.content;
    if(!title){
      title = null;
    }
    return (
      <div className="border-bottom">
      {notepad.selectedId === note.id ?
        <div>
          <input className="todo-input" placeholder="Type something..." value={title} onChange={this.onChange} />
          <div className="deleteFunction">
          {this.state.isConfirming ?
            <div>
              <button className="confirmButton" onClick={this.onDelete}>V</button>
              <button className="cancelButton" onClick={this.onCancelDelete}>X</button>
            </div> :
            <button className="deleteButton" onClick={this.onDelete}>X</button>
          }
          </div>
        </div>
        :
        <div>
        <input className="todo-input" placeholder="Type something..." value={title} onChange={this.onChange} />
        </div>
      }
      </div>
    );
  }
});

//<NoteSummary note={note} />
var NotesList = React.createClass({
  onChange: function(id, value){
    this.props.onChange(id, value);
  },
  onDelete: function(id, value){
    this.props.onDelete(id);
  },
  render: function(){
    var notepad = this.props.notepad;
    var notes = notepad.notes;
    return (
        <div className="note-list">
          {notes.map (function (note){
              return(
                <div key={note.id} className={notepad.selectedId === note.id ? 'note-selected' : ''}>
                <a className="select-note-link" href="#" onClick={this.props.onSelectNote.bind(null, note.id)}>

                <NoteSummary note={note} notepad={notepad} onChange={this.onChange} onDelete={this.onDelete} />

                </a>
                </div>
              );
            }.bind(this))
          }
        </div>
    );
  }
});

var Notepad = React.createClass({
  loadCommentsFromServer: function() {
    $.ajax({
      url: "/todos.json",
      dataType: 'json',
      cache: false,
      success: function(data) {
        //this.setState({data: data});
        this.props.onLoadNotes(data);
      }.bind(this),
      error: function(xhr, status, err) {
        console.error("failed to load comments");
      }.bind(this)
    });
  },
  componentDidMount: function() {
    this.loadCommentsFromServer();
    setInterval(this.loadCommentsFromServer, 2000);
  },
  render: function(){
    var notepad = this.props.notepad;
    var editor = null;
    var selectedNote = _.find(notepad.notes, function(note) {
      return note.id === notepad.selectedId;
    });

    // if(selectedNote){
    //   editor = <NoteEditor key={selectedNote.id} note={selectedNote} onChange={this.props.onChangeNote} onDelete={this.props.onDeleteNote} />
    // }

    return (
      <div className="container">
      <div id="notepad">
      <NotesList notepad={notepad} onSelectNote={this.props.onSelectNote} onChange={this.props.onChangeNote} onDelete={this.props.onDeleteNote} />
      <div className="addbuttoncontainer"> <button className="addbutton" onClick={this.props.onAddNote}>Add new</button></div>

      </div>
      </div>
    );
  }
});

var onChange = function(){

  ReactDOM.render(<Notepad notepad={notepad} onLoadNotes={onLoadNotes} onSelectNote={onSelectNote} onAddNote={onAddNote} onChangeNote={onChangeNote} onDeleteNote={onDeleteNote}/>, document.getElementById('app'));
}
$(function() {
onChange();
})
