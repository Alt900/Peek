from . import plt,filesystem,Line2D,np,os

def graph_df(df):
    color_assignment=['r','g','b','purple','orange','white','teal']
    print("Graphing Open, High, Low, and Closing prices...")
    for ticker in df:
        _,axes = plt.subplots(7,sharex=True,figsize=(15,15))
        for i,var in enumerate(df[ticker].columns):
            axes[i].plot(df[ticker].index,df[ticker][var],color=color_assignment[i],label=var)
            axes[i].legend()
        axes[0].set_title(f"{ticker} data")
        plt.tight_layout()
        plt.legend()
        plt.savefig(f"{os.getcwd()}{filesystem}react_gui{filesystem}public{filesystem}Assets{filesystem}Graphs{filesystem}{ticker}_data.png")
        plt.close()

def graph_df_3d(x,Dependent,Independent,colors=None,labels=None):
    print("Graphing 3D Open, High, Low, and Closing prices...")
    _, ax = plt.subplots(subplot_kw={"projection": "3d"})
    if type(Independent)!=list:
        ax.plot(x,Dependent,Independent)
    else:
        ci=0
        label_proxies=[]
        for z in Independent:
            ax.plot(x,Dependent,z,color=colors[ci])
            label_proxies.append(Line2D([0],[0],color=colors[ci],lw=2))
            ci+=1
        plt.legend(label_proxies,labels)
    ax.set_xlabel('Date')
    ax.set_ylabel('Opening Price')
    plt.title("Correlation field")
    plt.show()
    plt.savefig(f"{os.getcwd()}{filesystem}Assets{filesystem}Graphs{filesystem}3D_Data.png")
    plt.close()
        
def graph_prediction_merged(time_series,predicted_vector,filename="train_predict_merged"):
    XAxis = [x for x in range(len(time_series.index))]
    plt.tight_layout()
    _, axes = plt.subplots(3,figsize=(16,16))
    axes[0].plot(
        XAxis,
        time_series,
        color='r'
    )
    axes[0].title.set_text(f"Training dataset")
    PredictedXAxis=[x for x in range(len(XAxis),len(predicted_vector)+len(XAxis))]

    axes[1].plot(
        PredictedXAxis,
        predicted_vector,
        color='g'
    )

    axes[1].title.set_text(f"Predicted values")

    FullXAxis = XAxis+PredictedXAxis
    FullYAxis = np.concatenate((time_series.values,predicted_vector))
    axes[2].plot(
        FullXAxis,
        FullYAxis,
        color='b'
    )
    axes[2].title.set_text(f"Training and predicted datasets combined")
    plt.savefig(f"{os.getcwd()}{filesystem}Assets{filesystem}Graphs{filesystem}{filename}.png")
    plt.close()

def graph_prediction_overlapped(time_series,predicted_vector,filename="Test_predict_overlap"):
    XAxis = [x for x in range(len(time_series))]
    plt.tight_layout()
    _, axes = plt.subplots(3,figsize=(16,16))
    PredictedXAxis=[x for x in range(len(predicted_vector))]

    axes[0].plot(
        XAxis,
        time_series,
        color='r'
    )

    axes[1].plot(
        PredictedXAxis,
        predicted_vector,
        color='g'
    )

    axes[2].plot(
        XAxis,
        time_series,
        color='r'
    )

    axes[2].plot(
        PredictedXAxis,
        predicted_vector,
        color='g'
    )

    axes[0].title.set_text(f"Real values")
    axes[1].title.set_text(f"Predicted values")
    axes[2].title.set_text(f"Overlapped")
    plt.savefig(f"{os.getcwd()}{filesystem}Assets{filesystem}Graphs{filesystem}{filename}.png")
    plt.close()

def Graph_forecast(ax,filename="forecast_graph"):
    plt.savefig(f"{os.getcwd()}{filesystem}Assets{filesystem}Graphs{filesystem}{filename}.png")
    plt.close()

def graph_strikes(indexes,values,low_strike,high_strike):
    _,ax=plt.subplots(1)
    ax.plot(indexes,values,color='white')
    ax.plot((indexes[0],indexes[-1]),(high_strike,high_strike),color='lime')
    ax.plot((indexes[0],indexes[-1]),(low_strike,low_strike),color='r')
    plt.tight_layout()
    plt.savefig(f"{os.getcwd()}{filesystem}Assets{filesystem}Graphs{filesystem}Strike_prices.png")
    plt.close()

def Graph_indicator(indexes,values,results,indicator_name):
    _,ax=plt.subplots(2)
    ax[0].plot(indexes,values,color='g')
    ax[1].plot(indexes,results,color='b')
    proxies=[
        Line2D([0],[0],color='g'),
        Line2D([0],[0],color='b')
    ]
    plt.legend(proxies,["original data",indicator_name])
    plt.tight_layout()
    plt.savefig(f"{os.getcwd()}{filesystem}Assets{filesystem}Graphs{filesystem}{indicator_name}.png")
    plt.close()

def Graph_polyfunc(dataset,func):
    x=dataset.index
    y=dataset.values
    plt.plot(x,y,'-g',label="dataset")
    plt.plot(x,func(x),'--w',label="line of best fit")
    plt.legend()
    plt.savefig(f"{os.getcwd()}{filesystem}Assets{filesystem}Graphs{filesystem}Linear_regression.png")
    plt.close()

def plot_interpolation(dataset,interpolated_set):
    plt.plot(dataset.index,dataset.values,color='g',label='Original dataset')
    plt.plot(dataset.index, interpolated_set, color='b', label = 'Interpolation result')
    plt.savefig(f"{os.getcwd()}{filesystem}Assets{filesystem}Graphs{filesystem}Interpolation.png")
    plt.close()