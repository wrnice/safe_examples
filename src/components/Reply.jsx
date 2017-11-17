import React, { Component } from 'react';
import { observable, action } from 'mobx';
import { observer } from 'mobx-react';
import PropTypes from 'prop-types';

import SafeApi from '../safe_api';
import constant from '../constants';

@observer
class Reply extends Component {
  getDeleteLink() {
    const { reply, deleteReply } = this.props;
    return (
      <div className="_opt">
        <button
          className="deleteReply"
          onClick={() => { deleteReply(reply); }}
        >Delete
        </button>
      </div>
    );
  }

  componentDidMount() {

       var heart = '\u2665';
       var elements = document.getElementsByClassName('heart'),
           n = elements.length;
       for (var i = 0; i < n; i++) {
          var e = elements[i];
           e.innerHTML=heart;
           //if some likes, color red
      };

    //   var elements = document.getElementsByClassName('howmanylikes'),
    //       n = elements.length;
    //   for (var i = 0; i < n; i++) {
    //      var e = elements[i];
    //       var id = e.id;
    //       var oneheart = document.getElementById("heart"+id);
    //       oneheart.innerHTML=heart;
    //       var howmanylikes = e.innerHTML;
    //       console.log ( "howmanylikes : innerHTML : ", howmanylikes); //debug
    //       if ( howmanylikes != "0"  ) { oneheart.style.color="#fa6c8d";} ;
    //       //if some likes, color red
    //  };

  }



  render() {
    const { reply, isOwner } = this.props;
    const deleteLink = isOwner ? this.getDeleteLink() : null;

    var thetopic = window.getParameterByName ( "t", window.location.search );

    this.api = new SafeApi();

    var getlikes = this.api.getlikes(thetopic).then( function(result)  {
      var thelikes = result +"";
      // now find how many pairs contain the id
      var re = new RegExp(reply.id+"", "g"); //should be hashed
      var howmanylikes = ( thelikes.match(re) || []).length;

      //console.log ( 'reply : ', howmanylikes );//debug
      document.getElementById(reply.id).innerHTML=howmanylikes;
      var oneheart = document.getElementById("heart"+reply.id);
      if ( howmanylikes != "0"  ) { oneheart.style.color="#fa6c8d";} ;
    });

    return (

      <div className="reply">
      <div className="replydescr">
         <span id={"author"+reply.id} className="user">{' '+reply.name+' :'}</span>
          <span className="replydate">{' '+new Date(reply.date).toLocaleString()+' '}</span>
      </div>

      <div className="message">{reply.message}</div>
        <div className="replybuttons">
          <div className="likes">
            <span className="howmanylikes" id={reply.id}></span> likes <span id={"heart"+reply.id} className ="heart" onClick={ () => this.heartButtonPressed(thetopic,reply.id) } ></span>
          </div>
        </div>
        <div className="_opts">
          {deleteLink}
        </div>

      </div>

    );
  }

  @action
  heartButtonPressed = (thetopic,replyId) => {

  //console.log ( 'heartButtonPressed : reply ID : ', replyId ); //debug

  var userId = document.getElementById('userID').value;
  //console.log ( 'heartButtonPressed : user ID : ', userId ); //debug

  var match = userId+","+replyId;

  var api = new SafeApi();
  var thetopic = window.getParameterByName ( "t", window.location.search );

  //console.log ( 'heartbuttonpressed : thetopic : ', thetopic ); //debug

  var getlikes = api.getlikes( thetopic ).then( function(result)  {
    var likes = result + "";
    var userId = document.getElementById('userID').value;
    //console.log ( 'heartbuttonpressed : likes : ', likes ); //debug
    var alreadyLiked = likes.includes('['+userId+','+replyId); // TODO should be hashed
    var selflike = document.getElementById("author"+replyId).innerHTML.includes(userId);

    if ( userId == constant.ANONYMOUS ) { console.log ( "anonymous can't like !");
    } else if (  selflike  ) { console.log ( "can't self like !");
    } else if ( alreadyLiked ) { console.log ( "you already liked");
    } else {
      console.log ( "adding your like");
      // insert userID,replyID in the likes mutable key
      var api = new SafeApi();
      var thetopic = window.getParameterByName ( "t", window.location.search );
      var addlike = api.addLike ( thetopic , replyId, userId ).then( function()  { // TODO should be hashed
      // increment the like count
      var re = new RegExp(replyId, "g"); // TODO should be hashed
      var newlikes = ( likes.match(re) || [] ).length +1;
      document.getElementById(replyId).innerHTML=newlikes;
      //color the heart :
      document.getElementById("heart"+replyId).style.color="#fa6c8d";



    });
  }
  });

  };


}

Reply.propTypes = {
  reply: PropTypes.shape({
    name: PropTypes.string.isRequired,
    date: PropTypes.string.isRequired,
    message: PropTypes.string.isRequired,
  }).isRequired,
  isOwner: PropTypes.bool.isRequired,
  deleteReply: PropTypes.func.isRequired,
};



export default Reply;
