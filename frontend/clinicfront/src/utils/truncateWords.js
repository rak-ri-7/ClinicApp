const truncateWords = (text, limit) => {
  // Return early if the text is empty or not a string
  if (!text || typeof text !== "string") {
    return "";
  }

  const words = text.split(" ");
  if (words.length > limit) {
    return words.slice(0, limit).join(" ") + "...";
  }

  return text;
};

export default truncateWords;
