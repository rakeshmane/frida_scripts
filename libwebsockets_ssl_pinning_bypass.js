
function hook_curl_easy_setopt( _export, module_n ) {

const some_func = new NativeFunction(_export, "void", ["pointer"]);

Interceptor.replace(_export, new NativeCallback(function (pointer) {

/*
struct lws_client_connect_info {
	struct lws_context *context;
	const char *address;
	int port;
	int ssl_connection;
	// LCCSCF_USE_SSL | LCCSCF_ALLOW_SELFSIGNED 
	// (1 << 0) | (1 << 1)
	// 2

	ref: https://github.com/warmcat/libwebsockets/blob/c1b8e20246248c907c635a7f6e62280244cc44b9/include/libwebsockets/lws-client.h
	ref: https://github.com/warmcat/libwebsockets/blob/c1b8e20246248c907c635a7f6e62280244cc44b9/lib/core-net/client/connect.c
*/

  console.log(pointer.readInt()) // size - 4 byte
  console.log("[#] libwebsockets SSL Pinning bypass script [#]")
  console.log("Hostname: "+pointer.add(Process.pointerSize).readPointer().readUtf8String()); 
  console.log("Port: "+pointer.add(Process.pointerSize*2).readInt()); 
  pointer.add(Process.pointerSize*3).writeInt(3); // // LCCSCF_USE_SSL | LCCSCF_ALLOW_SELFSIGNED , changing the parameter to allow self signed certificates
 // console.log(pointer.add(Process.pointerSize*3).readInt()); // 
 console.log("Bypassed SSL pinning, self signed certificates should be allowed now.")

  some_func(pointer);
}, "void", ["pointer"]));


}

function main() {
    let lws_client_connect_via_info_found = false;
    let modules = Process.enumerateModules();

    for ( let _module of modules ) {

        let _export = _module.findExportByName( 'lws_client_connect_via_info' );

        if ( _export != null ) {
            lws_client_connect_via_info_found = true;
            console.log( `[#] Found lws_client_connect_via_info in ${_module.name}` )
            hook_curl_easy_setopt( _export ,_module.name);
        }
    }

    if ( !lws_client_connect_via_info_found ) {
        console.log( '[#] Cannot find export lws_client_connect_via_info' );
    }
}

Java.perform(
    main()
);



