class Message {
  constructor(role, content, turn) {
    this.role = role;
    this.content = content;
    this.turn = turn;
    this.timestamp = new Date().toISOString();
  }
}

module.exports = Message;