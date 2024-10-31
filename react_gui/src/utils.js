import { useEffect, useRef, useState } from "react";

export async function FetchRoute(
    Dispatcher,
    RequestedRoute,
    state_key=null){
    try{

        const resp = await fetch(RequestedRoute);
        if (!resp.ok){
            console.error(`There was an error fetching a rout to ${RequestedRoute}`)
        }
        let data = await resp.json();
        if (Dispatcher===null){
            return data.payload;
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

export async function FetchJSON(Selected_DataFile,dispatcher){
    try{
        const resp = await fetch(`/FetchJSON?ticker=${Selected_DataFile}`);
        if (!resp.ok){
            console.error(`There was an error fetching JSON from ${Selected_DataFile}`)
        }
        console.log(resp);
        const data = await resp.json();
        StateObject_Handler(
            {key:"Cached_JSON",target:data.payload},
            dispatcher,
            "JSON"
        );
    } catch (err){
        console.error(`There was an error reading the response\n${err}`);
    }
}

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
        case "JSON":
            return{...state,[action.payload.key]:[...action.payload.target]}
        default:
            return {...state,[action.payload.key]:action.payload.target.value};
    }
}

export const Univariate_Chart = ({data,variable}) => {
    let DataMap = data
    const UnivarRef = useRef(null);

    const Margin_Left = 10;
    const Margin_Top = 2;
    const padding = 40;
    const ZoomSensitivity = .1;
    const TextRotation = (-50*Math.PI)/180;
    const [Scale,SetScale] = useState(1);
    const [Origin,SetOrigin] = useState({x:0,y:0});
    const [Width,SetWidth] = useState(0);
    const [Height,SetHeight] = useState(0);

    const [MaxYBounds,SetMaxYBounds] = useState(0);
    const [MaxXBounds,SetMaxXBounds] = useState(0);
    const [MinYBounds,SetMinYBouds] = useState(0);
    const [MinXBounds,SetMinXbounds] = useState(0);

    const HandleZoom = (e) => {
        e.preventDefault();

        const Zoom = e.deltaY < 0 ? 1 + ZoomSensitivity : 1 - ZoomSensitivity;

        const rect = UnivarRef.current.getBoundingClientRect();
        const MouseX = e.clientX - rect.left;
        const MouseY = e.clientY - rect.top;

        const NewX = MouseX-(MouseX-Origin.x)*Zoom;
        //const NewY = MouseY-(MouseY-Origin.y)*Zoom;
        const NewY = Origin.y-(MouseY-Origin.y)*Zoom;
        console.log(NewY)
        SetOrigin({
            x : NewX > MaxXBounds ? MaxXBounds : NewX < MinXBounds ? MinXBounds : NewX,
            y : NewY > MaxYBounds ? MaxYBounds : NewY < MinYBounds ? MinYBounds : NewY
            });

        SetScale(prev=>Math.max(.1,prev*Zoom));
    }

    useEffect(()=>{
        let canvas = UnivarRef.current;
        if(canvas){
            const ComputedStyles = getComputedStyle(canvas);
            SetWidth(parseFloat(ComputedStyles.width));
            SetHeight(parseFloat(ComputedStyles.height));
            canvas.addEventListener('wheel',HandleZoom,{passive:false});
            return()=>{
                canvas.removeEventListener('wheel',HandleZoom);
            };
        };
    },[]);

    const Scale_X = (index) => {
        const position = (Width/DataMap.length)*index*padding;
        return position+Margin_Left;
    }

    const Scale_Y = (price,MinPrice,MaxPrice) => {
        const position = ((price-MinPrice)/(MaxPrice-MinPrice))*Height;
        return Height-position+Margin_Top;
    };

    useEffect(()=>{
        if(DataMap[0].name==='No data loaded'){return()=>{}}
        const canvas = UnivarRef.current;
        const ctx = canvas.getContext('2d');
        DataMap = DataMap.map(d=>d[variable]);

        ctx.setTransform(1,0,0,1,0,0);

        const MaxPrice = Math.max(...DataMap)
        const MinPrice = Math.min(...DataMap)
        SetMaxYBounds(Scale_Y(MaxPrice,MinPrice,MaxPrice)*Scale);
        SetMinYBouds(-344);
        SetMaxXBounds(Scale_X(DataMap.length)*Scale);
        SetMinXbounds(Scale_X(1)*Scale);

        ctx.clearRect(0,0,Width*DataMap.length,Height*DataMap.length);
        ctx.translate(Origin.x,Origin.y);
        ctx.scale(Scale,Scale);

        ctx.beginPath();
        ctx.moveTo(Scale_X(0),Scale_Y(DataMap[0],MinPrice,MaxPrice));

        ctx.font = '10px Arial';
        ctx.fillStyle = 'white';

        DataMap.forEach((Item,Index)=>{

            const X = Scale_X(Index);
            const Y = Scale_Y(Item,MinPrice,MaxPrice);
            ctx.lineTo(X,Y);
            const VisibleMax = (Width-Origin.x)/Scale;
            const VisibleMin = -Origin.x/Scale;
            if(X > VisibleMin && X < VisibleMax && Index%10===0){
                ctx.save();
                ctx.translate(X,Height);
                ctx.rotate(TextRotation);
                ctx.fillText(Index,0,0);
                ctx.restore();
            }
        });
        const Y_Adjustment = (MaxPrice/6).toFixed(2);
        for(let i = 1; i<=6; i++){
            //console.log(Scale_Y(Y_Adjustment*i,MinPrice,MaxPrice))
            ctx.fillText(`$${Y_Adjustment*i}`,-100,Scale_Y(Y_Adjustment*i,MinPrice,MaxPrice)-Height);
        }
        
        ctx.strokeStyle = "purple"
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.font = '16px Arial';
        ctx.fillStyle = 'white';

        return()=>{ctx.clearRect(0,0,Width*DataMap.length,Height*DataMap.length)}
    },[Scale,Origin,data]);
    return(<canvas ref={UnivarRef} className="Univariate_Chart" width={Width} height={Height}/>)
}

export const StateObject_Handler = (newstate,Disbatcher,SpecialCase=null) => {
    Disbatcher({
        type:SpecialCase,
        payload:newstate
    });
}

export const CandleStickChart = (data) => {
    data=data.data
    const Reference = useRef(null);

    const Margin_Left = 10;
    const Margin_Top = 2;
    const CandleWidth = 4;
    const padding = 40;

    //axis controlls
    const ZoomSensitivity = .1;
    const [Scale,SetScale] = useState(1);
    const [Origin,SetOrigin] = useState({x:1,y:1});
    let InitialOrigin_X = 1;
    let DeltaX = 1;

    let max_x_bounds = 0;
    let max_y_bounds = 0;
    let min_y_bounds = 0;

    //CSS dimension calculations
    const [Width,SetWidth] = useState(0);
    const [Height,SetHeight] = useState(0);

    const Scale_X = (index) => {
        const position = (Width/data.length)*index*padding;
        return position+Margin_Left;
    }

    const HandleZoom = (e) => {
        e.preventDefault();

        const Zoom = e.deltaY < 0 ? 1 + ZoomSensitivity : 1 - ZoomSensitivity;

        const rect = Reference.current.getBoundingClientRect();
        const MouseX = e.clientX - rect.left;
        const MouseY = e.clientY - rect.top;

        SetOrigin(prev=>({
            x : MouseX-(MouseX-prev.x)*Zoom,
            y : MouseY-(MouseY-prev.y)*Zoom
            }));

        SetScale(prev=>Math.max(.1,prev*Zoom));
    }

    const Dragging = useRef(false);

    const HandleMouseDown = (e) => {
        InitialOrigin_X = e.clientX;
        Dragging.current=true;
    };

    const HandleMouseMove = (e) =>{
        if(Dragging.current){
            DeltaX = (e.clientX - InitialOrigin_X)+DeltaX;
            SetOrigin(prev=>({x:DeltaX,y:prev.y}));
        }
    };

    const HandleMouseUp = (e) => {
        Dragging.current=false;
    };

    useEffect(()=>{
        let canvas = Reference.current;
        if(canvas){
            const ComputedStyles = getComputedStyle(canvas);
            SetWidth(parseFloat(ComputedStyles.width));
            SetHeight(parseFloat(ComputedStyles.height));
            canvas.addEventListener('wheel',HandleZoom,{passive:false});
            canvas.addEventListener('mousedown',HandleMouseDown);
            canvas.addEventListener('mousemove',HandleMouseMove);
            canvas.addEventListener('mouseup',HandleMouseUp);
            return()=>{
                canvas.removeEventListener('wheel',HandleZoom);
                canvas.removeEventListener('mousedown',HandleMouseDown);
                canvas.removeEventListener('mousemove',HandleMouseMove);
                canvas.removeEventListener('mouseup',HandleMouseUp);
            };
        };
    },[]);

    useEffect(()=>{
        if(data[0].name==='No data loaded'){return()=>{}}
        const canvas = Reference.current;
        const ctx = canvas.getContext('2d');

        ctx.setTransform(1,0,0,1,0,0);

        const MaxPrice = Math.max(...data.map(d=>d.high));
        const MinPrice = Math.min(...data.map(d=>d.low));

        ctx.clearRect(0,0,Width*data.length,Height*data.length);
        ctx.translate(Origin.x,Origin.y);
        ctx.scale(Scale,Scale);

        const Scale_Y = (price) => {
            const position = ((price-MinPrice)/(MaxPrice-MinPrice))*Height;
            return Height-position+Margin_Top;
        };

        let N = 1;

        max_x_bounds = Scale_X(data.length);
        max_y_bounds = Scale_Y(MaxPrice);
        min_y_bounds = Scale_Y(MinPrice);


        for(let Index = 1; Index<data.length; Index+=2){
            let X = Scale_X(N);

            let Y_Open = Scale_Y(data[N].open);
            let Y_Close = Scale_Y(data[N].close);
            let Y_High = Scale_Y(data[N].high);
            let Y_Low = Scale_Y(data[N].low);

            ctx.beginPath();
            
            //candle i

            ctx.moveTo(X+CandleWidth/2+padding,Y_High);
            ctx.lineTo(X+CandleWidth/2+padding,Y_Low);


            ctx.strokeStyle=data[N].close > data[N].open ? "green" : "red"//get css var of primary color
            ctx.stroke();

            ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--secondary_color')
            ctx.fillRect(X+padding,Math.min(Y_Open,Y_Close),CandleWidth,Math.abs(Y_Close-Y_Open));
            ctx.strokeRect(X+padding,Math.min(Y_Open,Y_Close),CandleWidth,Math.abs(Y_Close-Y_Open));

            //candle i + 1
            if (Index!==data.length){
                X = Scale_X(Index);

                Y_Open = Scale_Y(data[Index].open);
                Y_Close = Scale_Y(data[Index].close);
                Y_High = Scale_Y(data[Index].high);
                Y_Low = Scale_Y(data[Index].low);

                ctx.beginPath();

                ctx.moveTo(X+CandleWidth/2+padding,Y_High);
                ctx.lineTo(X+CandleWidth/2+padding,Y_Low);


                ctx.strokeStyle=data[Index].close > data[Index].open ? "green" : "red"//get css var of primary color
                ctx.stroke();

                ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--secondary_color');
                ctx.fillRect(X+padding,Math.min(Y_Open,Y_Close),CandleWidth,Math.abs(Y_Close-Y_Open));
                ctx.strokeRect(X+padding,Math.min(Y_Open,Y_Close),CandleWidth,Math.abs(Y_Close-Y_Open));
            }
            N+=1;
        }

        return()=>{ctx.clearRect(0,0,Width*90,Height*90);}
    },[Scale,Origin,data]);//recall on any dependency change


    return(<canvas ref={Reference} className="CandleStick_Canvas" width={Width} height={Height}/>)
}


export const Candlestick_Prediction = ({data,prediction}) => {
    const Reference = useRef(null);

    const Margin_Left = 10;
    const Margin_Top = 2;
    const CandleWidth = 4;
    const padding = 40;

    //axis controlls
    const ZoomSensitivity = .1;
    const [Scale,SetScale] = useState(1);
    const [Origin,SetOrigin] = useState({x:1,y:1});
    let InitialOrigin_X = 1;
    let DeltaX = 1;

    let max_x_bounds = 0;
    let max_y_bounds = 0;
    let min_y_bounds = 0;

    //CSS dimension calculations
    const [Width,SetWidth] = useState(0);
    const [Height,SetHeight] = useState(0);

    const Scale_X = (index) => {
        const position = (Width/data.length)*index*padding;
        return position+Margin_Left;
    }

    const HandleZoom = (e) => {
        e.preventDefault();

        const Zoom = e.deltaY < 0 ? 1 + ZoomSensitivity : 1 - ZoomSensitivity;

        const rect = Reference.current.getBoundingClientRect();
        const MouseX = e.clientX - rect.left;
        const MouseY = e.clientY - rect.top;

        SetOrigin(prev=>({
            x : MouseX-(MouseX-prev.x)*Zoom,
            y : MouseY-(MouseY-prev.y)*Zoom
            }));

        SetScale(prev=>Math.max(.1,prev*Zoom));
    }

    const Dragging = useRef(false);

    const HandleMouseDown = (e) => {
        InitialOrigin_X = e.clientX;
        Dragging.current=true;
    };

    const HandleMouseMove = (e) =>{
        if(Dragging.current){
            DeltaX = (e.clientX - InitialOrigin_X)+DeltaX;
            SetOrigin(prev=>({x:DeltaX,y:prev.y}));
        }
    };

    const HandleMouseUp = (e) => {
        Dragging.current=false;
    };

    useEffect(()=>{
        let canvas = Reference.current;
        if(canvas){
            const ComputedStyles = getComputedStyle(canvas);
            SetWidth(parseFloat(ComputedStyles.width));
            SetHeight(parseFloat(ComputedStyles.height));
            canvas.addEventListener('wheel',HandleZoom,{passive:false});
            canvas.addEventListener('mousedown',HandleMouseDown);
            canvas.addEventListener('mousemove',HandleMouseMove);
            canvas.addEventListener('mouseup',HandleMouseUp);
            return()=>{
                canvas.removeEventListener('wheel',HandleZoom);
                canvas.removeEventListener('mousedown',HandleMouseDown);
                canvas.removeEventListener('mousemove',HandleMouseMove);
                canvas.removeEventListener('mouseup',HandleMouseUp);
            };
        };
    },[]);

    useEffect(()=>{
        if(data[0].name==='No data loaded' || prediction[0] === undefined){return()=>{}}

        const canvas = Reference.current;
        const ctx = canvas.getContext('2d');

        ctx.setTransform(1,0,0,1,0,0);

        const MaxPrice = Math.max(...data.map(d=>d.high));
        const MinPrice = Math.min(...data.map(d=>d.low));

        ctx.clearRect(0,0,Width*data.length,Height*data.length);
        ctx.translate(Origin.x,Origin.y);
        ctx.scale(Scale,Scale);

        const Scale_Y = (price) => {
            const position = ((price-MinPrice)/(MaxPrice-MinPrice))*Height;
            return Height-position+Margin_Top;
        };

        let N = 1;

        max_x_bounds = Scale_X(data.length);
        max_y_bounds = Scale_Y(MaxPrice);
        min_y_bounds = Scale_Y(MinPrice);


        for(let Index = 1; Index<data.length; Index+=2){
            let X = Scale_X(N);

            let Y_Open = Scale_Y(data[N].open);
            let Y_Close = Scale_Y(data[N].close);
            let Y_High = Scale_Y(data[N].high);
            let Y_Low = Scale_Y(data[N].low);

            ctx.beginPath();
            
            //candle i

            ctx.moveTo(X+CandleWidth/2+padding,Y_High);
            ctx.lineTo(X+CandleWidth/2+padding,Y_Low);


            ctx.strokeStyle=data[N].close > data[N].open ? "green" : "red"//get css var of primary color
            ctx.stroke();

            ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--secondary_color')
            ctx.fillRect(X+padding,Math.min(Y_Open,Y_Close),CandleWidth,Math.abs(Y_Close-Y_Open));
            ctx.strokeRect(X+padding,Math.min(Y_Open,Y_Close),CandleWidth,Math.abs(Y_Close-Y_Open));

            //candle i + 1
            if (Index!==data.length){
                X = Scale_X(Index);

                Y_Open = Scale_Y(data[Index].open);
                Y_Close = Scale_Y(data[Index].close);
                Y_High = Scale_Y(data[Index].high);
                Y_Low = Scale_Y(data[Index].low);

                ctx.beginPath();

                ctx.moveTo(X+CandleWidth/2+padding,Y_High);
                ctx.lineTo(X+CandleWidth/2+padding,Y_Low);


                ctx.strokeStyle=data[Index].close > data[Index].open ? "green" : "red"//get css var of primary color
                ctx.stroke();

                ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--secondary_color');
                ctx.fillRect(X+padding,Math.min(Y_Open,Y_Close),CandleWidth,Math.abs(Y_Close-Y_Open));
                ctx.strokeRect(X+padding,Math.min(Y_Open,Y_Close),CandleWidth,Math.abs(Y_Close-Y_Open));
            }
            N+=1;
        }

        N = 0;

        for(let Index = data.length; Index<prediction[0].length+data.length; Index+=2){
            let X = Scale_X(Index);

            let Y_Open = Scale_Y(prediction[0][N]);
            let Y_Close = Scale_Y(prediction[1][N]);
            let Y_High = Scale_Y(prediction[2][N]);
            let Y_Low = Scale_Y(prediction[3][N]);

            ctx.beginPath();

            ctx.moveTo(X+CandleWidth/2+padding,Y_High);
            ctx.lineTo(X+CandleWidth/2+padding,Y_Low);


            ctx.strokeStyle=prediction[1][N] > prediction[0][N] ? "rgb(0, 255, 165)" : "rgb(255, 0, 90)"
            ctx.stroke();

            ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--secondary_color')
            ctx.fillRect(X+padding,Math.min(Y_Open,Y_Close),CandleWidth,Math.abs(Y_Close-Y_Open));
            ctx.strokeRect(X+padding,Math.min(Y_Open,Y_Close),CandleWidth,Math.abs(Y_Close-Y_Open));

            if (Index!==prediction[0].length){
                X = Scale_X(Index);

                Y_Open = Scale_Y(prediction[0][Index]);
                Y_Close = Scale_Y(prediction[1][Index]);
                Y_High = Scale_Y(prediction[2][Index]);
                Y_Low = Scale_Y(prediction[3][Index]);

                ctx.beginPath();

                ctx.moveTo(X+CandleWidth/2+padding,Y_High);
                ctx.lineTo(X+CandleWidth/2+padding,Y_Low);

                ctx.strokeStyle=prediction[1][Index] > prediction[0][Index] ? "rgb(0, 255, 165)" : "rgb(255, 0, 90)"
                ctx.stroke();

                ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--secondary_color');
                ctx.fillRect(X+padding,Math.min(Y_Open,Y_Close),CandleWidth,Math.abs(Y_Close-Y_Open));
                ctx.strokeRect(X+padding,Math.min(Y_Open,Y_Close),CandleWidth,Math.abs(Y_Close-Y_Open));
            }
            N+=1;
        }

        return()=>{ctx.clearRect(0,0,Width*90,Height*90);}
    },[Scale,Origin,data,prediction]);


    return(<canvas ref={Reference} className="CandleStick_Canvas" width={Width} height={Height} style={{backgroundColor:"black"}}/>)
}

export const Dropdown = ({Options,State,Dispatcher}) => {
    const [Dropped,SetDropped] = useState(false);
    return(
        <div className="Dropdown">
            <button 
                className="DropButton"
                onClick={()=>SetDropped(true)}
            >{State}</button>
            {Dropped &&
                <div className="DropdownOptionsContainer">
                    {Options.map((Item,Index)=>(
                        <button 
                            key={Index}
                            style={{top:`${((Index+1)*50)}%`,height:"50%",zIndex:"10"}}
                            className="DropdownButton"
                            onClick={()=>{Dispatcher(Item);SetDropped(false)}}
                        >{Item}</button>
                    ))}
                </div>
            }
        </div>
    )
}