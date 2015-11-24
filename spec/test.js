

describe("Testing Two Numbers", function () {
    var a = 4;
    var b = 3;
    it("Add Numbers", function () {
        expect(a + b).toEqual(7);
    });
});

describe("Hello world", function() {

    it("should say hello", function() {
        expect(helloWorld()).toEqual("Hello world!");
    });
  /*
    it("mece should say hello", function() {
        expect(meceNotifications.client.meceHelloWorld()).toEqual("Hello world!");
    });
    */
});
