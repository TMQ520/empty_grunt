QUnit.module("Group DOM Test", {
    beforeEach: function(){
        console.log("Test setup");
    },
    afterEach: function(){
        console.log("Test teardown");
    }
});
QUnit.test("Demo",function (assert) {
	var dom=document.getElementById("qunit-fixtrue");
	assert.deepEqual($("#qunit-fixtrue")[0],dom,"选择成功!");
});