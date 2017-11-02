const generateId = () => {
  const array = new Uint32Array(5);
  window.crypto.getRandomValues(array);
  return array.join('-');
};

export default class TopicModel {
  constructor(title, author, op, date_created, last_modified, id = generateId()) {
    this.title = title;
    this.author = author;
    this.op = op;
    this.date_created = date_created;
    this.last_modified = last_modified;
    this.id = id;
  }
}
