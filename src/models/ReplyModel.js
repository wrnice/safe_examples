const generateId = () => {
  const array = new Uint32Array(5);
  window.crypto.getRandomValues(array);
  return array.join('-');
};

export default class ReplyModel {

  constructor(name, message, date, id = generateId()) {
    this.name = name;
    this.date = date;
    this.message = message;
    this.id = id;
    // TODO likes ?
    // likes could be the length of a list of the IDs of people who "liked" a specific reply.
    // if someone clicks 'like' AND they are not anonymous , their ID is added to the list.
    // If they try to like again, they can't because the ID is already in the list.
  }
}
