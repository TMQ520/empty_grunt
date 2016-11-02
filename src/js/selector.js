define(["mconst"],function  (mconst) {
	window.$=function (selStr) {
		var result={};
		for (var selector in mconst.sels) {
			debugger;
			if((result=mconst.sels[selector](selStr,window.$))){
				break;
			}
		};
		return window.$;
	}
});