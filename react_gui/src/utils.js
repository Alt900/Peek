import { useEffect, useLayoutEffect, useRef, useState } from "react";

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

export function CheckBox({Options,ListState,Dispatcher}){
    return(
        <div className="CheckBox">
            {Options.map((Item,Index)=>{
                return(
                    <>
                        <button
                            className="CheckBoxButton"
                            onClick={()=>{
                                Dispatcher(ListState.map((Itm,Idx)=>Index===Idx?!Itm:Itm))
                            }}
                            style={{top:`${Index*10}%`}}
                        >{ListState[Index]==true?"✓":"✗"}</button>
                        <h3 
                            className="CheckBoxLabel"
                            style={{top:`${Index*10}%`}}
                        >{Item}</h3>
                    </>
                )
            })}
        </div>
    )
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
        case "RemoveTickers":
            return {...state,[action.payload.key]: action.payload.target[0].filter(item => item !== action.payload.target[1])}
        case "API_Route":
            return{...state,[action.key]:action.payload}
        case "JSON":
            return{...state,[action.payload.key]:[...action.payload.target]}
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

export const UnivariateChart = ({data,Width,Height,Variable}) => {
    const Reference = useRef(null);

    useEffect(()=>{
        if(data=== undefined){return()=>{}}
        const canvas = Reference.current;
        const ctx = canvas.getContext('2d');
        const Min = Math.min(...data);
        const Max = Math.max(...data);
        const ScaleY = Height/Max;
        const ScaleX = Width/data.length;

        ctx.clearRect(0,0,Width,Height);

        const XTicks = Width/(20*ScaleX);
        const YTicks = (Max-Min)/12;

        ctx.strokeStyle="white";

        for(let i = 0; i<=data.length; i+=XTicks){
            const X = ScaleX*i;
            ctx.beginPath();
            ctx.moveTo(X,0);
            ctx.lineTo(X,Height);
            ctx.stroke();
            ctx.fillText(`Day ${i.toFixed(2)}`,X,20)
        }

        for(let i = Min; i<=Max; i+=YTicks){
            const Y = Height-ScaleY*(i-Min);
            ctx.beginPath();
            ctx.moveTo(0,Y);
            ctx.lineTo(Width,Y);
            ctx.stroke();
            ctx.fillText(`${Variable}$${i.toFixed(2)}%`,20,Y-5);
        }


        ctx.save();
        ctx.translate(0,Height*.3); 

        ctx.beginPath();
        for(let i = 1; i<=data.length; i++){
            ctx.moveTo(ScaleX*(i-1),ScaleY*data[i-1]);
            ctx.lineTo(ScaleX*i,ScaleY*data[i])
            ctx.stroke();
        }
        return()=>{ctx.restore()}
    },[data]);
    return(<canvas ref={Reference} className="CandleStick_Canvas" width={Width} height={Height}/>)
}

export const LossGraph = ({data,Width,Height,type}) => {
    const Reference = useRef(null);
    const TTV = [`Training ${type}`,`Testing ${type}`,`Validation ${type}`]
    const TTV_Color = ["Red","Orange","Blue"]

    useEffect(()=>{
        if(data[0]=== undefined){return()=>{}}
        const canvas = Reference.current;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0,0,Width,Height);

        const Min = Math.min(...data[0]);
        const Max = Math.max(...data[0]);
        const ScaleY = Height/Max;
        const ScaleX = Width/data[0].length;

        let XTicks = Width/(20*ScaleX);
        let YTicks = (Max-Min)/12;
        ctx.fillStyle = "white";
        ctx.strokeStyle="white";
        ctx.font = "12px Arial";

        for(let i = 0; i<=data[0].length; i+=XTicks){
            const X = ScaleX*i;
            ctx.beginPath();
            ctx.moveTo(X,0);
            ctx.lineTo(X,Height);
            ctx.stroke();
            ctx.fillStyle = "white"
            ctx.fillText(`Epoch ${Math.round(i+1)}`,X,20)
        }

        for(let i = Min; i<=Max; i+=YTicks){
            const Y = Height-ScaleY*(i-Min);
            ctx.beginPath();
            ctx.moveTo(0,Y);
            ctx.lineTo(Width,Y);
            ctx.stroke();
            ctx.fillText(`${type} ${i.toFixed(2)}%`,20,Y-5);
        }

        ctx.save();
        ctx.translate(0,Height*0.5); 

        data.forEach((Item,Index)=>{
            ctx.strokeStyle=TTV_Color[Index]
            ctx.fillStyle=TTV_Color[Index]
            ctx.font = "18px Arial";
            ctx.beginPath();
            ctx.moveTo(0,ScaleY*Min);
            for(let i = 0; i<Item.length; i++){
                ctx.lineTo(ScaleX*i,ScaleY*Item[i]);
            }
            ctx.stroke();
            const Y = -(220+Index*30)
            ctx.fillRect(Width-220,Y,15,15);
            ctx.fillStyle="white";
            ctx.fillText(TTV[Index],Width-200,Y+12)
        })
        return()=>{ctx.restore()}
    },[data]);
    return(<canvas ref={Reference} className="CandleStick_Canvas" width={Width} height={Height}/>)
}

export const HeatMap = ({data,Width,Height,labelarray}) => {
    const Reference = useRef(null);
    const cell_gap = 10;

    function PearsonCorrelation(A,B,N){
        const Mean_A = A.reduce((a,b)=>a+b,0)/N;
        const Mean_B = B.reduce((a,b)=>a+b,0)/N;

        let Numerator = 0;
        let Denominator_A = 0;
        let Denominator_B = 0;

        for (let i = 0; i<N; i++){
            let DiffA = A[i] - Mean_A;
            let DiffB = B[i] - Mean_B;
            Numerator += DiffA * DiffB;
            Denominator_A += DiffA * DiffA;
            Denominator_B += DiffB * DiffB;
        }
        return Numerator/Math.sqrt(Denominator_A*Denominator_B);
    }

    useEffect(()=>{
        const CorrelationMatrix = [];
        const Matrix = Object.keys(data[0]).map(key=>data.map(object=>object[key]));
        const N = Matrix[0].length;
        Matrix.splice(4,1);
        for (let x = 0; x<Matrix.length; x++){
            CorrelationMatrix[x] = [];
            for (let y = 0; y<Matrix.length; y++){
                if(x===y){
                    CorrelationMatrix[x][y] = 1;
                } else {
                    CorrelationMatrix[x][y] = PearsonCorrelation(Matrix[x],Matrix[y],N);
                }
            }
        }
        const canvas = Reference.current;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0,0,Width,Height);
        ctx.save()
        ctx.translate(Width*.25,Height*.25)
        ctx.font = `${20-Matrix.length}px Arial`;

        let H = Height/cell_gap;
        let W = Width/cell_gap;
        let TextWidth = ctx.measureText("0.00").width;
        CorrelationMatrix.forEach((row,x)=>{
            row.forEach((value,y)=>{
                ctx.fillStyle = value < 0? `rgb(0,0,${Math.abs(Math.floor(255 * value))})`:`rgb(${Math.abs(Math.floor(255 * value))},0,0)`;
                ctx.fillRect(x*W,y*H,W,H);
                ctx.fillStyle = "white";
                let textX = x*W+(W-TextWidth)/2;
                let textY = y*H+H/2; 
                ctx.fillText(value.toFixed(2),textX,textY);
                if(x===y){
                    ctx.fillText(labelarray[x],Matrix[0].length+2*W+(W-TextWidth)/2,y*H+H/2)
                }
            }); 
        }); 
        ctx.font = "12px Arial"; 
        ctx.fillStyle = "white";
        CorrelationMatrix[0].forEach((_,Index)=>{
            ctx.fillText(labelarray[Index],cell_gap+Index*W,cell_gap-17);
        })
        return(()=>{ctx.restore();})
    },[data]); 
    return (<canvas ref={Reference} className="CandleStick_Canvas" width={Width} height={Height}/>)
}


export const CandleStickChart = ({data,XAxisSensitivity,Leveling,Zoom}) => {
    const Reference = useRef(null);
    const CandleWidth = 4;
    const padding = 40;

    //axis controlls
    const [Origin,SetOrigin] = useState({x:1,y:1});
    //CSS dimension calculations
    const Width = useRef(0);
    const Height = useRef(0);
    //min max bounds
    const Max_X = useRef(0);
    const Min_Y = useRef(0);
    const Max_Y = useRef(0);
    const GlobalData = useRef(0);
    const GlobalLeveling = useRef(Leveling);
    const GlobalCurrentMinY = useRef(0);
    const GlobalCurrentMaxY = useRef(0);
    const GlobalIndexInView = useRef(0);
    const GlobalZoom = useRef(Zoom);
    const GlobalXAxisSensitivity = useRef(XAxisSensitivity);

    let InitialOrigin_X = 1;
    let InitialOrigin_Y = 1;
    let DeltaX = 1;
    let DeltaY = 1;

    const Scale_Y = (price,min,max) => {
        const Scaled = (price-min)/(max-min);
        const Position = Scaled * Height.current
        return Height.current-Position;
    };

    useEffect(()=>{
        let MaxPrice = Math.max(...data.map(d=>d.high));
        let MinPrice = Math.min(...data.map(d=>d.low));

        Max_X.current = Scale_X(GlobalData.current.length);
        Min_Y.current = Scale_Y(MinPrice,MinPrice,MaxPrice);
        Max_Y.current = Scale_Y(MaxPrice,MinPrice,MaxPrice);
        SetOrigin({x:1,y:Height.current*Leveling})
    },[data,Leveling]);

    const Scale_X = (index) => {
        const position = (Width.current/GlobalData.current.length)*index*padding;
        return position;
    }

    const Dragging = useRef(false);

    const HandleMouseDown = (e) => {
        InitialOrigin_X = e.clientX;
        InitialOrigin_Y = e.clientY;
        Dragging.current=true;
    };

    const HandleMouseMove = (e) =>{
        if(Dragging.current){
            DeltaX += (e.clientX-InitialOrigin_X)/GlobalXAxisSensitivity.current; 
            DeltaY += (e.clientY - InitialOrigin_Y)/GlobalXAxisSensitivity.current; 
            DeltaX = DeltaX > 0 ? 0 : DeltaX > Max_X.current ? Max_X.current : DeltaX;//wont restrain the end of the dataset 
            DeltaY = DeltaY < Min_Y.current ? Min_Y.current : DeltaY > Max_Y.current ? Max_Y.current : DeltaY;
            const Index = Math.floor(Math.abs(DeltaX)/((Width.current/GlobalData.current.length)*padding));
            const InView = GlobalData.current.slice(Index,Index+10)
            const tempmax = Math.max(...InView.map(d=>d.high));
            const tempmin = Math.min(...InView.map(d=>d.low));
            GlobalCurrentMaxY.current = tempmax;
            GlobalCurrentMinY.current = tempmin;
            GlobalIndexInView.current=Index;
            SetOrigin({x:DeltaX,y:(Height.current-(tempmax-tempmin))*GlobalLeveling.current});
            InitialOrigin_X = e.clientX;
            InitialOrigin_Y = e.clientY;
        }
    };

    const HandleMouseUp = (_) => {
        Dragging.current=false;
    };

    useEffect(()=>{
        let canvas = Reference.current;
        if(canvas){
            const ComputedStyles = getComputedStyle(canvas);
            Width.current = parseFloat(ComputedStyles.width);
            Height.current = parseFloat(ComputedStyles.height)
            canvas.addEventListener('mousedown',HandleMouseDown);
            canvas.addEventListener('mousemove',HandleMouseMove);
            canvas.addEventListener('mouseup',HandleMouseUp);
            return()=>{
                canvas.removeEventListener('mousedown',HandleMouseDown);
                canvas.removeEventListener('mousemove',HandleMouseMove);
                canvas.removeEventListener('mouseup',HandleMouseUp);
            };
        };
    },[]);

    useEffect(()=>{
        if(data[0].name==='No data loaded'){return()=>{}}
        GlobalData.current = data;
        const canvas = Reference.current;
        const ctx = canvas.getContext('2d');
        GlobalLeveling.current = Leveling
        GlobalZoom.current = Zoom;
        GlobalXAxisSensitivity.current = XAxisSensitivity

        ctx.setTransform(1,0,0,1,0,0); 

        ctx.clearRect(0,0,Width.current*data.length,Height.current*data.length);
        ctx.translate(Origin.x,Origin.y);
        ctx.scale(1*Zoom,-1*Zoom);

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        let XTicks = Math.floor(data.length/(200*Zoom));
        //draw x labels and gridlines
        ctx.fillStyle = "white"
        ctx.font = "10px Arial";
        for(let i = 0; i<=data.length; i+=XTicks){
            const To = (Min_Y.current/1.5)-20;
            const X = Scale_X(i);
            ctx.beginPath();
            ctx.moveTo(X+padding,0);
            ctx.lineTo(X+padding,(Height.current*Leveling*Zoom));
            ctx.stroke();

            ctx.save();
            ctx.scale(1*Zoom,-1)
            ctx.translate(X+padding,-To);
            ctx.rotate(Math.PI/10);
            ctx.fillText(`day ${i}`,0,0)
            ctx.restore();
        }

        let YTicks = Math.round((GlobalCurrentMaxY.current-GlobalCurrentMinY.current)/(12*Zoom));
        if(YTicks==0){
            YTicks = 12;
        }

        for(let i = GlobalCurrentMinY.current; i<=GlobalCurrentMaxY.current; i+=YTicks){
            const Y_Position = Scale_Y(i,GlobalCurrentMinY.current,GlobalCurrentMaxY.current)*Leveling;
            const X = Scale_X(Math.floor((GlobalIndexInView.current+9+Zoom)/Zoom));
            const X_Grid = Scale_X(GlobalIndexInView.current+14);
            ctx.beginPath();
            ctx.moveTo(X-Width.current,Y_Position);
            ctx.lineTo(X_Grid,Y_Position);
            ctx.stroke();

            ctx.save();
            ctx.scale(1,-1);
            ctx.translate(X+padding,-Y_Position);
            ctx.fillText(`$${i.toFixed(2)}`,0,0);
            ctx.restore();
        }

        let N = 1;

        for(let Index = 1; Index<data.length; Index+=2){
            let X = Scale_X(N);

            let Y_Open = Scale_Y(data[N].open,Min_Y.current,Max_Y.current);
            let Y_Close = Scale_Y(data[N].close,Min_Y.current,Max_Y.current);
            let Y_High = Scale_Y(data[N].high,Min_Y.current,Max_Y.current);
            let Y_Low = Scale_Y(data[N].low,Min_Y.current,Max_Y.current);

            ctx.beginPath();
            
            //candle i

            ctx.moveTo(X+CandleWidth/2+padding,Y_High);
            ctx.lineTo(X+CandleWidth/2+padding,Y_Low);


            ctx.strokeStyle=data[N].close > data[N].open ? "green" : "red"
            ctx.stroke();

            ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--secondary_color')
            ctx.fillRect(X+padding,Math.min(Y_Open,Y_Close),CandleWidth,Math.abs(Y_Close-Y_Open));
            ctx.strokeRect(X+padding,Math.min(Y_Open,Y_Close),CandleWidth,Math.abs(Y_Close-Y_Open));

            //candle i + 1
            if (Index!==data.length){
                X = Scale_X(Index);

                Y_Open = Scale_Y(data[Index].open,Min_Y.current,Max_Y.current);
                Y_Close = Scale_Y(data[Index].close,Min_Y.current,Max_Y.current);
                Y_High = Scale_Y(data[Index].high,Min_Y.current,Max_Y.current);
                Y_Low = Scale_Y(data[Index].low,Min_Y.current,Max_Y.current);

                ctx.beginPath();

                ctx.moveTo(X+CandleWidth/2+padding,Y_High);
                ctx.lineTo(X+CandleWidth/2+padding,Y_Low);


                ctx.strokeStyle=data[Index].close > data[Index].open ? "green" : "red"
                ctx.stroke();

                ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--secondary_color');
                ctx.fillRect(X+padding,Math.min(Y_Open,Y_Close),CandleWidth,Math.abs(Y_Close-Y_Open));
                ctx.strokeRect(X+padding,Math.min(Y_Open,Y_Close),CandleWidth,Math.abs(Y_Close-Y_Open));
            }
            N+=1;
        }
        return()=>{ctx.clearRect(0,0,Width.current*90,Height*90);}
    },[Origin,Leveling,Zoom,XAxisSensitivity,data]);
    return(<canvas ref={Reference} className="CandleStick_Canvas" width={Width.current} height={Height.current}/>)
}

export const NonInteractableCandleStickChart = ({data,Height,Width}) => {
    const Reference = useRef(null);
    const CandleWidth = 4;
    const padding = 40;

    useEffect(()=>{
        const Max = Math.max(...data.map((d)=>d.high))
        const ScaleY = Height/Max;
        const ScaleX = Width/data.length;

        const canvas = Reference.current;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0,0,Width*data.length,Height*data.length);
        ctx.save() 
        ctx.translate(0,Height*-0.5)

        let N = 1;

        for(let Index = 1; Index<data.length; Index+=2){
            let X = ScaleX*N;

            let Y_Open = ScaleY*data[N].open;
            let Y_Close = ScaleY*data[N].close;
            let Y_High = ScaleY*data[N].high;
            let Y_Low = ScaleY*data[N].low;

            ctx.beginPath();
            
            //candle i

            ctx.moveTo(X+CandleWidth/2+padding,Y_High);
            ctx.lineTo(X+CandleWidth/2+padding,Y_Low);


            ctx.strokeStyle=data[N].close > data[N].open ? "green" : "red"
            ctx.stroke();

            ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--secondary_color')
            ctx.fillRect(X+padding,Math.min(Y_Open,Y_Close),CandleWidth,Math.abs(Y_Close-Y_Open));
            ctx.strokeRect(X+padding,Math.min(Y_Open,Y_Close),CandleWidth,Math.abs(Y_Close-Y_Open));
            N+=1;
        }
        return()=>{ctx.restore()}
    },[data]);
    return(<canvas ref={Reference} className="CandleStick_Canvas" width={Width} height={Height}/>)
}

export const NonInteractableUnivariateChart = ({data,Width,Height}) => {
    const Reference = useRef(null);
    useEffect(()=>{
        if(data[0]=== undefined){return()=>{}}
        data = data.slice(0,100);//small slice for display purposes
        const canvas = Reference.current;
        const ctx = canvas.getContext('2d');
        let Min = Math.min(...data);
        let Max = Math.max(...data);

        ctx.clearRect(0,0,Width,Height);
        ctx.save()
        ctx.translate(0,canvas.height*-0.5)
        ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--primary_color').trim();
        ctx.beginPath();
        const ScaleY = Height/Max;
        const ScaleX = Width/data.length;
        ctx.moveTo(0,ScaleY*Min);
        for(let i = 0; i<data.length; i++){
            ctx.lineTo(ScaleX*i,ScaleY*data[i]);
        }
        ctx.stroke();
        return()=>{ctx.restore()}
    },[data]);
    return(<canvas ref={Reference} className="CandleStick_Canvas" width={Width} height={Height}/>)
}

export const DisplayHeatMap = ({data,Width,Height}) => {
    const Reference = useRef(null);
    const cell_gap = 10;

    function PearsonCorrelation(A,B,N){
        const Mean_A = A.reduce((a,b)=>a+b,0)/N;
        const Mean_B = B.reduce((a,b)=>a+b,0)/N;

        let Numerator = 0;
        let Denominator_A = 0;
        let Denominator_B = 0;

        for (let i = 0; i<N; i++){
            let DiffA = A[i] - Mean_A;
            let DiffB = B[i] - Mean_B;
            Numerator += DiffA * DiffB;
            Denominator_A += DiffA * DiffA;
            Denominator_B += DiffB * DiffB;
        }
        return Numerator/Math.sqrt(Denominator_A*Denominator_B);
    }

    useEffect(()=>{
        const CorrelationMatrix = [];
        const Matrix = Object.keys(data[0]).map(key=>data.map(object=>object[key]));
        const N = Matrix[0].length;
        for (let x = 0; x<Matrix.length; x++){
            CorrelationMatrix[x] = [];
            for (let y = 0; y<Matrix.length; y++){
                if(x===y){
                    CorrelationMatrix[x][y] = 1;
                } else {
                    CorrelationMatrix[x][y] = PearsonCorrelation(Matrix[x],Matrix[y],N);
                }
            }
        }
        const canvas = Reference.current;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0,0,Width,Height);
        ctx.save()
        ctx.translate(0,Height*0.04)
        ctx.font = `${20-Matrix.length}px Arial`;
    
        let H = Height/cell_gap;
        let W = Width/cell_gap;
        let TextWidth = ctx.measureText("0.00").width;
        CorrelationMatrix.forEach((row,x)=>{
            row.forEach((value,y)=>{
                ctx.fillStyle = value < 0? `rgb(0,0,${Math.abs(Math.floor(255 * value))})`:`rgb(${Math.abs(Math.floor(255 * value))},0,0)`;
                ctx.fillRect(x*W,y*H,W,H);
                ctx.fillStyle = "white";
                let textX = x*W+(W-TextWidth)/2;
                let textY = y*H+H/2;
                ctx.fillText(value.toFixed(2),textX,textY);
            });
        });
        ctx.font = "12px Arial";
        ctx.fillStyle = "white";
        return()=>{ctx.restore()}
        },[data]);
    return (<canvas ref={Reference} className="CandleStick_Canvas" width={Width} height={Height}/>)
}

export const CandleStick_Prediction = ({data,Variables,Height,Width}) => {
    const Reference = useRef(null);
    const CandleWidth = 4;
    const padding = 40;

    useEffect(()=>{
        if(data[0]===undefined){return()=>{}}
        const Max = Math.max(...data[Variables.indexOf("high")]);
        const ScaleY = Height/Max;
        const ScaleX = Width/data[0].length;

        const canvas = Reference.current;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0,0,Width*data[0].length,Height*data[0].length);
        ctx.save();
        ctx.translate(0,Height*-0.5);

        let N = 1;

        for(let Index = 1; Index<data[0].length; Index+=2){
            let X = ScaleX*N;

            let Y_Open = ScaleY*data[Variables.indexOf("open")][N];
            let Y_Close = ScaleY*data[Variables.indexOf("close")][N];
            let Y_High = ScaleY*data[Variables.indexOf("high")][N];
            let Y_Low = ScaleY*data[Variables.indexOf("low")][N];

            ctx.beginPath();

            ctx.moveTo(X+CandleWidth/2+padding,Y_High);
            ctx.lineTo(X+CandleWidth/2+padding,Y_Low);


            ctx.strokeStyle=data[Variables.indexOf("close")][N] > data[Variables.indexOf("open")][N] ? "green" : "red";
            ctx.stroke();

            ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--secondary_color');
            ctx.fillRect(X+padding,Math.min(Y_Open,Y_Close),CandleWidth,Math.abs(Y_Close-Y_Open));
            ctx.strokeRect(X+padding,Math.min(Y_Open,Y_Close),CandleWidth,Math.abs(Y_Close-Y_Open));
            N+=1;
        }
        return()=>{ctx.restore();}
    },[data]);
    return(<canvas ref={Reference} className="CandleStick_Canvas" width={Width} height={Height}/>)
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