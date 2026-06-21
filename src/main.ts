import { createApp } from "vue";
import App from "./App.vue";
import router from "./router/router.ts";
import { createPinia } from "pinia";
import { useAuth } from "./utils/Authentication/auth.ts";


if(localStorage.getItem("theme") === "dark"){
 (async()=>{
    try{
        const auth = useAuth();
        const authenticated = await auth.checkToken();
        console.log(authenticated)
    }
    catch(error){
        console.log(error)
    }
 })()
}else{
  document.documentElement.classList.remove("dark");
}

createApp(App)
  .use(createPinia())
  .use(router)
  .mount("#app");
