const generateId = () => {
  const array = new Uint32Array(5);
  window.crypto.getRandomValues(array);
  return array.join('-');
};

const generateLikes = () => {
  // likes as an array of pairs : [ [replyID, user ID] , [replyID, user ID], [replyID, user ID], ... ]
  const likes = [];
  likes.push ['none','none'];
  return likes
}

export default class TopicModel {
  //constructor(title, author, op, date_created, last_modified, id = generateId()) {
  constructor(author, title, date, op, lastmod , repliescount, category, likes = generateLikes(), id = generateId() ) {
    this.author = author;
    this.date = date;
    this.title = title;
    this.op = op;
    this.likes = likes;
    this.id = id;
    this.lastmod = lastmod;
    this.repliescount = repliescount;
    this.category = category;
  }
}

// the topics mutable is designed as follows :
//
//  key : hash ( HOSTNAME+topicname ) , value : "{ author:'author',
//                                         title:'title',
//                                         date:'date',
//                                         op :'op',
//                                          last_modified,
//                                          repliescount,
//                                          category,
//                                          likes ,
//                                          id }"
//  key : hash ( HOSTNAME+topicname ) , value : "{ author:'author',
//                                         title:'title',
//  ... ... etc etc
