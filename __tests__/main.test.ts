describe("when a PR is created", () => {
  it.todo("should create the initial comment");
});

describe("when the checkbox is ticked", () => {
  it.todo("should delete the comment if the checkbox is now ticked");
  it.todo("should try to merge the PR");
  describe("if the merge is succesful", () => {
    it.todo("should do nothing more");
  });
  describe("if the merge is unsuccesful", () => {
    it.todo(
      "should comment the reason why and ping the person that ticked the checkbox"
    );
  });
});
