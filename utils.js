function correctBoards(boards) {
  const regex = /(^| +|\t+)(?!@)(\w+)/gm;
  return boards.replace(regex, '$1$2');
}

function correctMessage(message, boards, label) {
  return message.replace('{boards}', boards).replace('{label}', label)
}

module.exports = { correctBoards, correctMessage };
