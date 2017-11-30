import ReplyModel from './models/ReplyModel';
import TopicModel from './models/TopicModel';
import Constants from './constants';

const {
  ERROR_MSG,
  ERROR_CODE,
  PERMISSIONS,
  PUBLIC_NAMES_CONTAINER,
  HOSTNAME,
  FORUMNAME
} = Constants;

// Unique TYPE_TAG for refering the MutableData. Number can be anything above the reserved rage (0-15000)
const TYPE_TAG = 15001;
// Constant value for the `.` Delimitter
const DOT = '.';

let hostName = window.location.hostname;
if (hostName.split(DOT).length === 1) {
  hostName = `www.${hostName}`;
}

// console.log ( "hostname :" , hostName );

// Authorisation model
const APP = {
  info: {
    id: `${hostName}-simple-forum`,
    name: `${hostName}-simple-forum`,
    vendor: 'Nice',
  },
  opts: { own_container: false },
  containers: {
    _publicNames: [PERMISSIONS.READ],
  },
};

/**
 * SafeApi handles the SAFE Network related requests for managing the replies for a topic and create new topics in a forum.
 * Exposes function for the store/UI to save/retrieve replies list against a topic, and save/retrieve a topic list for a forum.
 * Also exposes other utility functions for getting Public ID list and also to validate the user is admin
 */
export default class SafeApi {

  /**
   * @constructor
   * @param {any} topic
   * @param {any} nwStateCb
   */
  constructor(topic, nwStateCb) {
    this.topic = topic;
    this.replies = [];
    this.topics = [];
    this.app = undefined;
    this.likes = [];
    this.topicsMutableData = undefined;
    this.repliesMutableData = undefined;
    this.TOPICS_MD_NAME = `${hostName}-${this.topic}`;
    this.nwStateCb = (newState) => {
      nwStateCb(newState);
    };
  }

  /**
  * Fetches the public Ids associated to the user.
  */
  getPublicNames() {

    console.log ( "getpublicnames");

    return new Promise(async (resolve, reject) => {
      const decryptedPublicNames = [];
      try {
        if (!this.app) {
          return reject(new Error(ERROR_MSG.APP_NOT_INITIALISED_ERROR));
        }
        // Get public names container handle
        const publicNamesContainerHandle = await window.safeApp.getContainer(this.app, PUBLIC_NAMES_CONTAINER);
        // Get handle for the keys for the public names container
        const keysHandle = await window.safeMutableData.getKeys(publicNamesContainerHandle);
        const keysLen = await window.safeMutableDataKeys.len(keysHandle);
        // If there is no Public ID return empty list
        if (keysLen === 0) {
          //return resolve([]); // LIVE : toggle this when live on Safe
          return resolve(["johny","mary","paul"]); // LIVE : toggle this when live on Safe
        }
        const publicNames = [];
        // get all keys from the conatiner.
        await window.safeMutableDataKeys.forEach(keysHandle, (key) => {
          publicNames.push(key);
        });
        window.safeMutableDataKeys.free(keysHandle);
        // Decrypt the keys to get the actual Public ID
        for (const publicName of publicNames) {
          try {
            const decryptedValue = await window.safeMutableData.decrypt(publicNamesContainerHandle, publicName);
            decryptedPublicNames.push(String.fromCharCode.apply(null, new Uint8Array(decryptedValue)));
          } catch (e) {
            console.warn(e);
          }
        }
        window.safeMutableData.free(publicNamesContainerHandle);
      } catch (err) {
        return reject(err);
      }
      // resolve with the decrypted public names
      return resolve(decryptedPublicNames); // LIVE : toggle this when live on Safe
      //return resolve(["johny","mary","paul"]);// LIVE : toggle this when live on Safe

    });
  }

  /**
  * Set up the MutableData with Insert permission for Everyone.
  * Create a Public Mutable Data with a deterministic name. (Hash(location.hostname + topic))
  * Apply the permission set for the MutableData
  */
  setup() {
    return new Promise(async (resolve, reject) => {
      try {

        console.log ( "setup" );

        // are we already initialased ?
        // are we already authorized ?
        // are we already connected ?
        var theapp = sessionStorage.getItem("app");
        var theauth = sessionStorage.getItem("auth");

        if ( !theapp  ) {
          this.app = await window.safeApp.initialise(APP.info, this.nwStateCb);
          sessionStorage.setItem("app", this.app );
          //console.log ( "setup : storing " , sessionStorage.getItem("app") , ' - > sessionStorage app ', );//debug
        } else {
          this.app = sessionStorage.getItem("app");
          //console.log ( "setup : fetching " , 'sessionStorage app - > ',this.app );//debug
        }

        if ( !theauth  ) {
        const uri = await window.safeApp.authorise(this.app, APP.containers, APP.opts);
        var auth = await window.safeApp.connectAuthorised(this.app, uri);

        sessionStorage.setItem("auth", auth );
        }

        const isOwner = await this.isOwner();
        if (!isOwner) {
          throw new Error(ERROR_MSG.PUBLIC_ID_DOES_NOT_MATCH);
        }
        const hashedName = await window.safeCrypto.sha3Hash(this.app, this.TOPICS_MD_NAME);
        this.topicsMutableData = await window.safeMutableData.newPublic(this.app, hashedName, TYPE_TAG);

        await window.safeMutableData.quickSetup(
          this.topicsMutableData,
          {},
          `${this.TOPICS_MD_NAME} - Simple Forum`,
          `topics for the hosting ${this.TOPICS_MD_NAME} is saved in this MutableData`,
        );
        // create a new permission set
        const permSet = await window.safeMutableData.newPermissionSet(this.app);
        // allowing the user to perform the Insert operation
        await window.safeMutableDataPermissionsSet.setAllow(permSet, PERMISSIONS.INSERT  ); // ???
        // setting the handle as null, anyone can perform the Insert and update operation
        await window.safeMutableData.setUserPermissions(this.topicsMutableData, null, permSet, 1);
        await window.safeMutableDataPermissionsSet.setAllow(permSet, PERMISSIONS.UPDATE);
        // setting the handle as null, anyone can perform the Insert operation
        await window.safeMutableData.setUserPermissions(this.repliesMutableData, null, permSet, 2);
        resolve();
      } catch (err) {
        reject(err);
      }
    });
  }

  /**
  * Create the MutableData for the TOPICS_MD_NAME
  */
  createTopicsMutableDataHandle() {
    return new Promise(async (resolve, reject) => {
      try {

        console.log ( "createTopicsMutableDataHandle" );

        // Initialising the app using the App info which requests for _publicNames container
        // are we already initialased ?
        // are we already authorized ?
        // are we already connected ?
        var theapp = sessionStorage.getItem("app");
        var theauth = sessionStorage.getItem("auth");

        if ( !theapp  ) {
          this.app = await window.safeApp.initialise(APP.info, this.nwStateCb);
          sessionStorage.setItem("app", this.app );
          //console.log ( "setup : storing " , sessionStorage.getItem("app") , ' - > sessionStorage app ', );//debug
        } else {
          this.app = sessionStorage.getItem("app");
          //console.log ( "setup : fetching " , 'sessionStorage app - > ',this.app );//debug
        }

        if ( !theauth  ) {
        const uri = await window.safeApp.authorise(this.app, APP.containers, APP.opts);
        var auth = await window.safeApp.connectAuthorised(this.app, uri);

        sessionStorage.setItem("auth", auth );
        }
        // Authorise the app and connect to the network using uri
        // const uri = await window.safeApp.authorise(this.app, APP.containers, APP.opts);
        // await window.safeApp.connectAuthorised(this.app, uri);
        // Compute the MutableData name
        const hashedName = await window.safeCrypto.sha3Hash(this.app, this.TOPICS_MD_NAME);

        // Create the handle for the MutableData
        this.topicsMutableData = await window.safeMutableData.newPublic(this.app, hashedName, TYPE_TAG);
        resolve();
      } catch (err) {
        reject(err);
      }
    });
  }

  /**
  * Invoked to check whether the Topics MutableData is set up.
  * Creates a unregistered client to try fetching the topics MutableData and get its entries.
  */
  isMDInitialised() {
    return new Promise(async (resolve, reject) => {
      try {

        console.log ( "isMDInitialised");

        // Connect as unregistered client
        const appHandle = await window.safeApp.initialise(APP.info, this.nwStateCb);
        await window.safeApp.connect(appHandle);

        const hashedName = await window.safeCrypto.sha3Hash(appHandle, this.TOPICS_MD_NAME);
        const mdHandle = await window.safeMutableData.newPublic(appHandle, hashedName, TYPE_TAG);
        // newPublic function only creates a handle in the local memmory.
        // The network operation is performed only when we call getEntries fo validating that the MutableData exists
        const entriesHandle = await window.safeMutableData.getEntries(mdHandle);
        window.safeMutableDataEntries.free(entriesHandle);
        window.safeMutableData.free(mdHandle);
        await window.safeApp.free(appHandle);
        resolve(true);
      } catch (err) {
        if (err.code === ERROR_CODE.REQUESTED_DATA_NOT_FOUND) {
          resolve(false);
        } else {
          reject(err);
        }
      }
    });
  }

  /**
  * Invoked to authorise the user.
  * Sets up the topics MutableData if it is not already initialised.
  */
  authorise() {
    return new Promise(async (resolve, reject) => {
      try {

        console.log ( "authorise" );

        const isInitialised = await this.isMDInitialised();
        if (!isInitialised) {
          // Create the MutableData if the current user is the owner
          await this.setup();
        } else {
          await this.createTopicsMutableDataHandle();
        }
        resolve();
      } catch (err) {
        reject(err);
      }
    });
  }

  /**
  * Check whether the user is Owner/Admin.
  * Fetch the own container and validate that the key IsAdmin is preset and value is set to true
  */
  isOwner() {
    return new Promise(async (resolve) => {
      try {

        console.log ( "isOwner" );

        const publicNames = await this.getPublicNames();
        const currPublicID = hostName.split(DOT).slice(1).join(DOT);
        //resolve(publicNames.indexOf(currPublicID) > -1); // LIVE : uncomment this !!
        resolve(true); // LIVE : comment this !!
      } catch (err) {
        resolve(false);
      }
    });
  }

  /**
  * Set up a MutableData for the replies to a Topic with Insert permission for Everyone.
  * Create a Public Mutable Data with a deterministic name. (Hash(location.hostname + topic))
  * Apply the permission set for the MutableData
  * the mutable contains :
  *     a special entry for the op ?
  *     a special entry for the list of likes : an array of ( reply ID - user ID ) pairs
  *     one entry for each reply, with : author, date, message, ID
  */
  setupReplies(topicname,date) {
    return new Promise(async (resolve, reject) => {
      try {

        console.log ( "setup replies : topicname = " , topicname);

        //this.app = await window.safeApp.initialise(APP.info, this.nwStateCb);
        //const uri = await window.safeApp.authorise(this.app, APP.containers, APP.opts);
        //await window.safeApp.connectAuthorised(this.app, uri);
        //const isOwner = await this.isOwner();
        //if (!isOwner) {
        //  throw new Error(ERROR_MSG.PUBLIC_ID_DOES_NOT_MATCH);
        //}
        const hashedName = await window.safeCrypto.sha3Hash(this.app, HOSTNAME+topicname );
        this.repliesMutableData = await window.safeMutableData.newPublic(this.app, hashedName, TYPE_TAG);
        await window.safeMutableData.quickSetup(
          this.repliesMutableData,
          { likes: "[0,0]" , last_modified: date },
          `${topicname} - Simple Forum`,
          `replies for the topic ${topicname} is saved in this MutableData`,
        );
        // create a new permission set
        const permSet = await window.safeMutableData.newPermissionSet(this.app);
        // allowing the user to perform the Insert operation
        await window.safeMutableDataPermissionsSet.setAllow(permSet, PERMISSIONS.INSERT);
        // setting the handle as null, anyone can perform the Insert operation
        await window.safeMutableData.setUserPermissions(this.repliesMutableData, null, permSet, 1);
        await window.safeMutableDataPermissionsSet.setAllow(permSet, PERMISSIONS.UPDATE);
        // setting the handle as null, anyone can perform the Insert operation
        await window.safeMutableData.setUserPermissions(this.repliesMutableData, null, permSet, 2);
        resolve();
      } catch (err) {
        reject(err);
      }
    });
  }

  /**
  * Post reply for the topic
  * @param {ReplyModel} replyModel
  */
  postReply(topicname, replyModel) {
    return new Promise(async (resolve, reject) => {
      try {
        console.log ( 'postreplies');

        const hashedName = await window.safeCrypto.sha3Hash(this.app, HOSTNAME+topicname );
        var repliesMutableData = await window.safeMutableData.newPublic(this.app, hashedName, TYPE_TAG);

        const entriesHandle = await window.safeMutableData.getEntries(repliesMutableData);
        var mutationHandle = await window.safeMutableDataEntries.mutate(entriesHandle);
        await window.safeMutableDataMutation.insert(mutationHandle, replyModel.id, JSON.stringify(replyModel));
        // Without calling applyEntriesMutation the changes wont we saved in the network
        await window.safeMutableData.applyEntriesMutation(repliesMutableData, mutationHandle);

        window.safeMutableDataMutation.free(mutationHandle);
        window.safeMutableDataEntries.free(entriesHandle);
        window.safeMutableDataEntries.free(repliesMutableData);

        this.replies = await this.listReplies(topicname);
        resolve(this.replies);
      } catch (err) {
        reject(err);
      }
    });
  }

  /**
  * List all replies for the topic
  */
  listReplies(topicname) {
    return new Promise(async (resolve) => {
      try {

        console.log ('listreplies : topicname = ' , topicname );
        if (topicname == "" ) {
          return;
        }

        // are we already initialased ?
        // are we already authorized ?
        // are we already connected ?
        var theapp = sessionStorage.getItem("app");
        var theauth = sessionStorage.getItem("auth");

        if ( !theapp || !theauth ) {

        this.app = await window.safeApp.initialise(APP.info, this.nwStateCb);
        const uri = await window.safeApp.authorise(this.app, APP.containers, APP.opts);
        var auth = await window.safeApp.connectAuthorised(this.app, uri);
        sessionStorage.setItem("app", this.app );
        sessionStorage.setItem("auth", auth );
        //console.log ( sessionStorage.getItem("app") , ' - > sessionStorage app ', );//debug
        //window.app = this.app;
      } else {
        this.app = sessionStorage.getItem("app");
        //console.log ( 'sessionStorage app - > ',this.app );//debug
      }

        const hashedName = await window.safeCrypto.sha3Hash(this.app, HOSTNAME+topicname );
        this.repliesMutableData = await window.safeMutableData.newPublic(this.app, hashedName, TYPE_TAG);

        const entriesHandle = await window.safeMutableData.getEntries(this.repliesMutableData);
        const len = await window.safeMutableDataEntries.len(entriesHandle);
        this.replies = [];
        if (len === 0) {
          return resolve(this.replies);
        }
        await window.safeMutableDataEntries.forEach(entriesHandle, (key, value) => { // do not treat the 'like' entry as a reply
          if (value.buf.length === 0 || key == "likes" || key =="last_modified" ) {
            return;
          }
          const jsonObj = JSON.parse(value.buf.toString());
          this.replies.push(new ReplyModel(jsonObj.name, jsonObj.message, jsonObj.date, jsonObj.id));
        });
        resolve(this.replies);
      } catch (err) {

        if ( err.message.includes("Requested data not found") ) { console.log('no such topic');this.replies = [];return resolve(this.replies) }
        else {

        console.warn('list replies: ', err);
        resolve(this.replies);
        }
      }
    });
  }

  /**
  * Delete reply for the topic
  * @param {any} replyModel
  */
  deleteReply(replyModel) {
    return new Promise(async (resolve, reject) => {
      try {
        const entriesHandle = await window.safeMutableData.getEntries(this.repliesMutableData);
        const mutationHandle = await window.safeMutableDataEntries.mutate(entriesHandle);
        const data = await window.safeMutableData.get(this.repliesMutableData, replyModel.id);
        await window.safeMutableDataMutation.remove(mutationHandle, replyModel.id, data.version + 1);
        await window.safeMutableData.applyEntriesMutation(this.repliesMutableData, mutationHandle);
        window.safeMutableDataMutation.free(mutationHandle);
        window.safeMutableDataEntries.free(entriesHandle);
        this.replies = await this.listReplies(topicname);
        resolve(this.replies);
      } catch (err) {
        reject(err);
      }
    });
  }

  /**
  * Publish new topic
  * @param {TopicModel} topicModel
  */
  publishTopic(topicModel) {
    return new Promise(async (resolve, reject) => {
      try {

        const topicID = await window.safeCrypto.sha3Hash(this.app, HOSTNAME+topicModel.title );

        const entriesHandle = await window.safeMutableData.getEntries(this.topicsMutableData);
        const mutationHandle = await window.safeMutableDataEntries.mutate(entriesHandle);
        await window.safeMutableDataMutation.insert(mutationHandle, topicID , JSON.stringify(topicModel));
        // Without calling applyEntriesMutation the changes wont we saved in the network
        await window.safeMutableData.applyEntriesMutation(this.topicsMutableData, mutationHandle);
        window.safeMutableDataMutation.free(mutationHandle);
        window.safeMutableDataEntries.free(entriesHandle);
        this.topics = await this.listTopics();
        resolve(this.topics);
      } catch (err) {
        reject(err);
      }
    });
  }

  /**
  * List all topics of the forum
  */
  listTopics() {
    return new Promise(async (resolve) => {
      try {

        console.log ( 'listTopics : this.topicsMutableData : ' , this.topicsMutableData ); // debug

        const entriesHandle = await window.safeMutableData.getEntries(this.topicsMutableData);
        const len = await window.safeMutableDataEntries.len(entriesHandle);
        this.topics = [];
        if (len === 0) {
          return resolve(this.topics);
        }
        await window.safeMutableDataEntries.forEach(entriesHandle, (key, value) => {
          if (value.buf.length === 0) {
            return;
          }
          const jsonObj = JSON.parse(value.buf.toString());
          //console.log ( " listTopics : key , json ", key.toString(), value.buf.toString() );//debug
          //
          this.topics.push(new TopicModel(
            jsonObj.author,
            jsonObj.title,
            jsonObj.date,
            jsonObj.op,
            jsonObj.lastmod ,
            jsonObj.repliescount,
            jsonObj.category ));
        });
        resolve(this.topics);
      } catch (err) {
        console.warn('list topics: ', err);
        resolve(this.topics);
      }
    });
  }

  /**
  * Delete topic from the forum
  * @param {any} topicModel
  */
  deleteTopic(topicModel) {
    return new Promise(async (resolve, reject) => {
      try {
        const entriesHandle = await window.safeMutableData.getEntries(this.topicsMutableData);
        const mutationHandle = await window.safeMutableDataEntries.mutate(entriesHandle);
        const data = await window.safeMutableData.get(this.topicsMutableData, topicModel.id);
        await window.safeMutableDataMutation.remove(mutationHandle, topicModel.id, data.version + 1);
        await window.safeMutableData.applyEntriesMutation(this.topicsMutableData, mutationHandle);
        window.safeMutableDataMutation.free(mutationHandle);
        window.safeMutableDataEntries.free(entriesHandle);
        this.topics = await this.listTopics();
        resolve(this.topics);
      } catch (err) {
        reject(err);
      }
    });
  }

  /**
  * Update last_modified for a topic :
  * Publish new topic
  */
  updateLastMod (topicname , date )  {
    return new Promise(async (resolve) => {
      try {

        //console.log('updatelastmod: topicname : ', topicname ); //debug

        // Initialising the app using the App info which requests for _publicNames container
        // are we already initialased ?
        // are we already authorized ?
        // are we already connected ?
        var theapp = sessionStorage.getItem("app");
        var theauth = sessionStorage.getItem("auth");

        if ( !theapp  ) {
          this.app = await window.safeApp.initialise(APP.info, this.nwStateCb);
          sessionStorage.setItem("app", this.app );
          //console.log ( "setup : storing " , sessionStorage.getItem("app") , ' - > sessionStorage app ', );//debug
        } else {
          this.app = sessionStorage.getItem("app");
          //console.log ( "setup : fetching " , 'sessionStorage app - > ',this.app );//debug
        }

        if ( !theauth  ) {
        const uri = await window.safeApp.authorise(this.app, APP.containers, APP.opts);
        var auth = await window.safeApp.connectAuthorised(this.app, uri);

        sessionStorage.setItem("auth", auth );
        }

        const topicMdName = `${hostName}-${FORUMNAME}`;

        // Compute the MutableData name
        const hashedName = await window.safeCrypto.sha3Hash(this.app, topicMdName);

        // Create the handle for the MutableData
        const topicsMutableData = await window.safeMutableData.newPublic(this.app, hashedName, TYPE_TAG);
        const entriesHandle = await window.safeMutableData.getEntries( topicsMutableData );

        const mutationHandle = await window.safeMutableDataEntries.mutate( entriesHandle);

        // get the topic json string , extract 'lastmod'
        // replace it by current date : date

        const topicID = await window.safeCrypto.sha3Hash(this.app, HOSTNAME+topicname );


            var topicJSON = await window.safeMutableData.get( topicsMutableData, topicID );

            const jsonObj = JSON.parse(topicJSON.buf.toString());

            jsonObj.lastmod = date;
            jsonObj.repliescount += 1;

            const updatedTopic= JSON.stringify(jsonObj);

            const mutation = await window.safeMutableDataMutation.update(mutationHandle, topicID , updatedTopic , topicJSON.version + 1);
            await window.safeMutableData.applyEntriesMutation( topicsMutableData, mutationHandle);


            // TODO free everything !!!!

                return resolve( );
                }

               catch (err) {
                console.warn('updatelastmod : ', err);
                resolve();
              }
            });
        }

        /**
        * get last_modified for a topic :
        */
        getLastMod (topicname )  {
          return new Promise(async (resolve) => {
            try {

              // are we already initialased ?
              // are we already authorized ?
              // are we already connected ?
              var theapp = sessionStorage.getItem("app");

              if ( !theapp ) {

              this.app = await window.safeApp.initialise(APP.info, this.nwStateCb);
              await window.safeApp.connect(this.app);
              sessionStorage.setItem("app", this.app );

              //console.log ( sessionStorage.getItem("app") , ' - > sessionStorage app ', ); //debug

            } else {
              this.app = sessionStorage.getItem("app");
              //console.log ( 'sessionStorage app - > ',this.app );//debug
            }

                      const hashedName = await window.safeCrypto.sha3Hash(this.app, HOSTNAME+topicname );
                      var topicMutableData = await window.safeMutableData.newPublic(this.app, hashedName, TYPE_TAG );
                      const entriesHandle = await window.safeMutableData.getEntries( topicMutableData);
                      const mutationHandle = await window.safeMutableDataEntries.mutate(entriesHandle);

                      const lastmod = await window.safeMutableData.get(topicMutableData, 'last_modified');
                      var oldlastmod = uintToString(lastmod.buf);
                      var newdate = new Date(oldlastmod).toLocaleString();

                      return resolve( newdate );
                      }

                     catch (err) {
                      console.warn('getlastmod: ', err);
                      resolve();
                    }
                  });
              }


  //
  /**
  * Get likes for a topic
  */
  getlikes (topicname) {
    return new Promise(async (resolve) => {
        try {

        //console.log ( "getlikes : topic name : ", topicname );//debug

        // are we already initialased ?
        // are we already authorized ?
        // are we already connected ?
        var theapp = sessionStorage.getItem("app");

        if ( !theapp ) {

        this.app = await window.safeApp.initialise(APP.info, this.nwStateCb);
        await window.safeApp.connect(this.app);
        sessionStorage.setItem("app", this.app );

        //console.log ( sessionStorage.getItem("app") , ' - > sessionStorage app ', ); //debug

      } else {
        this.app = sessionStorage.getItem("app");
        //console.log ( 'sessionStorage app - > ',this.app );//debug
      }

          const hashedName = await window.safeCrypto.sha3Hash(this.app, HOSTNAME+topicname );
          var topicMutableData = await window.safeMutableData.newPublic(this.app, hashedName, TYPE_TAG );


          const entriesHandle = await window.safeMutableData.getEntries( topicMutableData);


          const len = await window.safeMutableDataEntries.len(entriesHandle);
          this.likes = [];
          if (len === 0) {
            console.log('get likes: nothing...' );
            return resolve(this.likes);
          }
          var thelikes = await window.safeMutableDataEntries.get(entriesHandle, 'likes' );
          this.likes = uintToString(thelikes.buf);
          //console.log('get likes: ', this.likes );//debug
          //console.log('version : ', thelikes.version);//debug


          return resolve( this.likes );
          }

         catch (err) {
          console.warn('get likes: ', err);
          resolve(this.likes);
        }
      });
  }

  //
  /**
  * Add a like for a reply in a topic
  * @param {ReplyModel} replyModel
  */
  addLike (topicname,replyId,userId) {
    return new Promise(async (resolve) => {
        try {

        //console.log ( "addLike : topic name : ", topicname );//debug

      // are we already initialased ?
      // are we already authorized ?
      // are we already connected ?
      var theapp = sessionStorage.getItem("app");
      var theauth = sessionStorage.getItem("auth");

      if ( !theapp  ) {
        this.app = await window.safeApp.initialise(APP.info, this.nwStateCb);
        sessionStorage.setItem("app", this.app );
        //console.log ( "setup : storing " , sessionStorage.getItem("app") , ' - > sessionStorage app ', );//debug
      } else {
        this.app = sessionStorage.getItem("app");
        //console.log ( "setup : fetching " , 'sessionStorage app - > ',this.app );//debug
      }

      if ( !theauth  ) {
      const uri = await window.safeApp.authorise(this.app, APP.containers, APP.opts);
      var auth = await window.safeApp.connectAuthorised(this.app, uri);

              sessionStorage.setItem("auth", auth );
              }


          const hashedName = await window.safeCrypto.sha3Hash(this.app, HOSTNAME+topicname );
          var topicMutableData = await window.safeMutableData.newPublic(this.app, hashedName, TYPE_TAG );
          const entriesHandle = await window.safeMutableData.getEntries( topicMutableData);
          const mutationHandle = await window.safeMutableDataEntries.mutate(entriesHandle);

          const thelikes = await window.safeMutableData.get(topicMutableData, 'likes');
          var likes = uintToString(thelikes.buf);
          //console.log('add likes: ', likes ); //debug

          const newlikes = likes + '[' + userId + ',' + replyId + ']' ;

        //  console.log ("add likes : newlikes : ",newlikes); //debug

          const mutation = await window.safeMutableDataMutation.update(mutationHandle, 'likes', newlikes, thelikes.version + 1);
          await window.safeMutableData.applyEntriesMutation(topicMutableData, mutationHandle);

          return resolve( this.likes );
          }

         catch (err) {
          console.warn('add likes: ', err);
          resolve(this.likes);
        }
      });
  }

  reconnect() {
    return window.safeApp.reconnect(this.app);
  }
}
