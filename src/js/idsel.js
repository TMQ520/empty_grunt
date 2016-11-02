define(["mconst"],function  (mconst) {
	mconst.sels.push(function  (selStr,myquery) {
		if(!/#([\w-]+)/.test(selStr)){
			return false;
		}else{
			myquery[0]=document.getElementById(RegExp.$1);
		}
	});
});