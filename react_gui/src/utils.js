import { useEffect, useRef } from "react";

export async function FetchRoute(
    Router,
    Dispatcher,
    RequestedRoute,
    state_key=null){
    try{

        const resp = await fetch(Router[RequestedRoute]);
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

export const Statistics_Canvas = ({data,width=941,height=366})=>{
    const StatsCanvasRef = useRef(null);
    useEffect(()=>{
        if (data==="No data loaded"){
            return <></>
        }
        const canvas = StatsCanvasRef.current;
        const ctx = canvas.getContext('2d');

        ctx.clearRect(0,0,width,height);

        const padding = 30;
        const chartHeight = height-2*padding;
        const ChartWidth = width-2*padding;

        const MAX_Y = Math.max(data);
        const MIN_Y  = Math.min(data);
        const MAX_X = data.length;
        const MIN_X = 0; 

        const Normalize = price => height-padding-(price-MIN_Y)*scaleY;

        const scaleX = ChartWidth / (MAX_X - MIN_X);
        const scaleY = chartHeight / (MAX_Y - MIN_Y);

        const drawGrid=()=>{
            const Gridlines = Math.round(Math.log(data.length));
            ctx.strokeStyle='rgba(183, 183, 183, 0.9)';
            ctx.lineWidth=1;

            for(let i = 0; i<=Gridlines; i++){
                const x = width - padding - i * (ChartWidth/Gridlines);
                ctx.beginPath();
                ctx.moveTo(x,padding);
                ctx.lineTo(x,width-padding);
                ctx.stroke();
            };

            for(let i = 0; i<=Gridlines; i++){
                const y = height - padding - i * (chartHeight/Gridlines);
                ctx.beginPath();
                ctx.moveTo(padding,y);
                ctx.lineTo(width-padding,y);
                ctx.stroke();
            }
        }

        drawGrid();

        ctx.strokeStyle = 'blue';
        ctx.lineWidth = 2;
        ctx.fillStyle = 'rgba(0, 0, 0, 0)';

        ctx.beginPath();

        data.forEach((item,index) => {
            const x = padding+(Math.max(MIN_X,Math.min(index,MAX_X))-MIN_X)*scaleX;
            ctx.strokeStyle="transparent";
            ctx.beginPath();
            ctx.moveTo(x,item);
            ctx.lineTo(x,item);
            ctx.stroke();
        })

        ctx.stroke();

        ctx.fillStyle = 'rgba(0,0,0,0)';
        ctx.strokeStyle = 'rgba(0,0,0,0)';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';

        for(let i = 0; i<=5;i++){
            const x = padding + i * (ChartWidth/5);
            const label = MIN_X + i * ((MAX_X-MIN_X)/5);
            ctx.fillText(label.toFixed(0),x,height-padding+20)
        }

        ctx.textAlign = 'right';
        for (let i = 0; i<=5; i++){
            const labelvalue = (i*MAX_Y)/5;
            const y = height - padding - (labelvalue*scaleY);
            ctx.fillText(labelvalue.toFixed(0),padding-10,y+3);
        }


        ctx.lineTo(width-padding,height-padding);
        ctx.lineTo(padding,height-padding);
        ctx.closePath();
        ctx.fill();
    },[data,width,height]);
    return (
        <canvas ref={StatsCanvasRef} width={width} height={height}/>
    );
}

export const Machine_Learning_Canvas = ({data,prediction,width=941,height=366})=>{
    const StatsCanvasRef = useRef(null);
    useEffect(()=>{
        if (data===undefined || data==='No LSTM has been ran yet.'){
            return(<></>)
        }
        const canvas = StatsCanvasRef.current;
        const ctx = canvas.getContext('2d');

        ctx.clearRect(0,0,width,height);

        const padding = 30;
        const chartHeight = height-2*padding;
        const ChartWidth = width-2*padding;

        const MAX_Y = Math.max(data);
        const MIN_Y  = Math.min(data);
        const MAX_X = data.length;
        const MIN_X = 0; 

        const Normalize = price => height-padding-(price-MIN_Y)*scaleY;

        const scaleX = ChartWidth / (MAX_X - MIN_X);
        const scaleY = chartHeight / (MAX_Y - MIN_Y);

        const drawGrid=()=>{
            const Gridlines = Math.round(Math.log(data.length));
            ctx.strokeStyle='rgba(183, 183, 183, 0.9)';
            ctx.lineWidth=1;

            for(let i = 0; i<=Gridlines; i++){
                const x = width - padding - i * (ChartWidth/Gridlines);
                ctx.beginPath();
                ctx.moveTo(x,padding);
                ctx.lineTo(x,width-padding);
                ctx.stroke();
            };

            for(let i = 0; i<=Gridlines; i++){
                const y = height - padding - i * (chartHeight/Gridlines);
                ctx.beginPath();
                ctx.moveTo(padding,y);
                ctx.lineTo(width-padding,y);
                ctx.stroke();
            }
        }

        drawGrid();

        ctx.strokeStyle = 'blue';
        ctx.lineWidth = 2;
        ctx.fillStyle = 'rgba(0, 0, 0, 0)';

        ctx.beginPath();

        data.forEach((item,index) => {
            const x = padding+(Math.max(MIN_X,Math.min(index,MAX_X))-MIN_X)*scaleX;
            ctx.strokeStyle="transparent";
            ctx.beginPath();
            ctx.moveTo(x,item);
            ctx.lineTo(x,item);
            ctx.stroke();
        })

        ctx.stroke();

        ctx.strokeStyle = 'blue';

        ctx.beginPath();

        prediction.forEach((item,index) => {
            const x = padding+(Math.max(MIN_X,Math.min(index,MAX_X))-MIN_X)*scaleX;
            ctx.strokeStyle="transparent";
            ctx.beginPath();
            ctx.moveTo(x,item);
            ctx.lineTo(x,item);
            ctx.stroke();
        })

        ctx.fillStyle = 'rgba(0,0,0,0)';
        ctx.strokeStyle = 'rgba(0,0,0,0)';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';

        for(let i = 0; i<=5;i++){
            const x = padding + i * (ChartWidth/5);
            const label = MIN_X + i * ((MAX_X-MIN_X)/5);
            ctx.fillText(label.toFixed(0),x,height-padding+20)
        }

        ctx.textAlign = 'right';
        for (let i = 0; i<=5; i++){
            const labelvalue = (i*MAX_Y)/5;
            const y = height - padding - (labelvalue*scaleY);
            ctx.fillText(labelvalue.toFixed(0),padding-10,y+3);
        }


        ctx.lineTo(width-padding,height-padding);
        ctx.lineTo(padding,height-padding);
        ctx.closePath();
        ctx.fill();
    },[data,width,height]);
    return (
        <canvas ref={StatsCanvasRef} width={width} height={height}/>
    );
}

export const BarChart = ({data,width=1320,height=600})=>{
    const CanvasRef = useRef(null);
    useEffect(()=>{

        const canvas = CanvasRef.current;
        const ctx = canvas.getContext('2d');

        ctx.clearRect(0,0,width,height)

        const padding = 30;
        const chartHeight = height-2*padding;
        const ChartWidth = width-2*padding;

        const MAX_Y = Math.max(...data.map(item => item.high));
        const MIN_Y  = Math.min(...data.map(item=>item.low));
        const MAX_X = data.length;
        const MIN_X = 0; 

        const Normalize = price => height-padding-(price-MIN_Y)*scaleY;

        const scaleX = ChartWidth / (MAX_X - MIN_X);
        const scaleY = chartHeight / (MAX_Y - MIN_Y);

        const drawGrid=()=>{
            const Gridlines = Math.round(Math.log(data.length));
            ctx.strokeStyle='rgba(183, 183, 183, 0.9)';
            ctx.lineWidth=1;

            for(let i = 0; i<=Gridlines; i++){
                const x = width - padding - i * (ChartWidth/Gridlines);
                ctx.beginPath();
                ctx.moveTo(x,padding);
                ctx.lineTo(x,width-padding);
                ctx.stroke();
            };

            for(let i = 0; i<=Gridlines; i++){
                const y = height - padding - i * (chartHeight/Gridlines);
                ctx.beginPath();
                ctx.moveTo(padding,y);
                ctx.lineTo(width-padding,y);
                ctx.stroke();
            }
        }

        drawGrid();

        ctx.strokeStyle = 'blue';
        ctx.lineWidth = 2;
        ctx.fillStyle = 'rgba(0, 0, 0, 0)';

        ctx.beginPath();

        data.forEach((item,index) => {
            const Open = Normalize(item.open);
            const High = Normalize(item.high);
            const Low = Normalize(item.low);
            const Close = Normalize(item.close);

            const x = padding+(Math.max(MIN_X,Math.min(index,MAX_X))-MIN_X)*scaleX

            const CandleColor = item.close>item.open ? "green" : "red"
            ctx.strokeStyle="transparent";
            ctx.beginPath();
            ctx.moveTo(x,High);
            ctx.lineTo(x,Low);
            ctx.stroke();
            ctx.fillStyle=CandleColor;
            ctx.fillRect(x,Math.min(Open,Close),1,Math.abs(Close-Open))
        });

        ctx.stroke();

        ctx.fillStyle = 'rgba(0,0,0,0)';
        ctx.strokeStyle = 'rgba(0,0,0,0)';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';

        for(let i = 0; i<=5;i++){
            const x = padding + i * (ChartWidth/5);
            const label = MIN_X + i * ((MAX_X-MIN_X)/5);
            ctx.fillText(label.toFixed(0),x,height-padding+20)
        }

        ctx.textAlign = 'right';
        for (let i = 0; i<=5; i++){
            const labelvalue = (i*MAX_Y)/5;
            const y = height - padding - (labelvalue*scaleY);
            ctx.fillText(labelvalue.toFixed(0),padding-10,y+3);
        }


        ctx.lineTo(width-padding,height-padding);
        ctx.lineTo(padding,height-padding);
        ctx.closePath();
        ctx.fill();
    },[data,width,height]);
    return (
        <canvas ref={CanvasRef} width={width} height={height}/>
    );
};

export const ProgressBar = ({}) => {
    const BarRef = useRef(null);
    useEffect(()=>{
        
    })
}