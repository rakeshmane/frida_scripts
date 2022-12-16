
/*

Idea is to change the value of 'ssl_connection' parameter to 'LCCSCF_USE_SSL | LCCSCF_ALLOW_SELFSIGNED' in the struct 'lws_client_connect_info' passed to 'lws_client_connect_via_info' function, this will allow using selfsigned certificates.

struct lws_client_connect_info {
  struct lws_context *context;
  const char *address;
  int port;
  int ssl_connection;
  // LCCSCF_USE_SSL | LCCSCF_ALLOW_SELFSIGNED 
  // (1 << 0) | (1 << 1)
  // 3

  ref: https://github.com/warmcat/libwebsockets/blob/c1b8e20246248c907c635a7f6e62280244cc44b9/include/libwebsockets/lws-client.h

  ref: https://github.com/warmcat/libwebsockets/blob/c1b8e20246248c907c635a7f6e62280244cc44b9/lib/core-net/client/connect.c

*/


function hook_lws_client_connect_via_info( _export ) {

    const some_func = new NativeFunction(_export, "void", ["pointer"]);
    Interceptor.replace(_export, new NativeCallback(function (pointer) {
        console.log("____________________________")
        console.log("Byassing SSL pinning for: ")
        console.log("Hostname: "+pointer.add(Process.pointerSize).readPointer().readUtf8String()); 
        console.log("Port: "+pointer.add(Process.pointerSize+4).readInt()); 
        pointer.add(Process.pointerSize+4+4).writeInt(3); // // LCCSCF_USE_SSL | LCCSCF_ALLOW_SELFSIGNED , changing the parameter to allow self signed certificates
        //console.log(pointer.add(Process.pointerSize+4+4).readInt()); // 
        console.log("Bypass sucessful, self signed certificates should be allowed now.")
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
            hook_lws_client_connect_via_info( _export ,_module.name);
        }
    }
    if ( !lws_client_connect_via_info_found ) {
        console.log( '[#] Cannot find export lws_client_connect_via_info' );
    }
}

Java.perform(
    main()
);



