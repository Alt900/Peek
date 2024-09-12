export async function FetchRoute(Router,Dispatcher,RequestedRoute,state_key=null){
    try{
        const resp = await fetch(Router[RequestedRoute]);
        if (!resp.ok){
            console.error(`There was an error fetching a rout to ${RequestedRoute}`)
        }
        let data = await resp.json();
        if (Dispatcher===null){
            console.log(`No dispatcher provided, throwing out payload for ${RequestedRoute}`);
        } else {
            Dispatcher({
                type:"API_Route",
                payload: data.payload,
                key: state_key
            });
        }
    } catch (err){
        console.error(`There was an error reading the response\n${err}`);
    }
};

export function Object_Reducer (state,action){
    switch(action.type){
        case "IntOnly":
            const regex = /^-?\d*$/;
            if (regex.test(action.payload.target.value)){
                return {...state,[action.payload.key]:action.payload.target.value}
            }
            return
        case "Date":
            const date = action.payload.target;
            const year = date.getFullYear();
            const month = date.getMonth() + 1;
            const day = date.getDate();
            const datelist = [year, month, day];
            return {...state,[action.payload.key]:datelist,[action.payload.key+"DateObject"]:date};
        case "Dropdown":
            return{...state,[action.payload.key]:action.payload.target};
        case "AppendTickers":
            return{...state,[action.payload.key]:[...action.payload.target[0],action.payload.target[1]]};
        case "API_Route":
            return{...state,[action.key]:action.payload}
        default:
            return {...state,[action.payload.key]:action.payload.target.value};
    }
}

export const StateObject_Handler = (newstate,Disbatcher,SpecialCase=null) => {
    Disbatcher({
        type:SpecialCase,
        payload:newstate
    });
}