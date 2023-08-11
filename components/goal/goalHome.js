import { useState } from "react";
import { Button, Text, View } from "react-native";
import NewGoal from "./newGoal";
import DisplayGoal from "./displayGoal";

function GoalHome(){
    const [displayNewGoal,setDisplayNewGoal] = useState(false);
    const [goals,setGoals] = useState([]);
return(
    <View>
        <Text>Objectif :</Text>
        <Button title="Ajouter Objectif" onPress={()=>setDisplayNewGoal(true)}></Button>
        {
            displayNewGoal?<View><NewGoal></NewGoal></View>:""
        }
        {
            goals.map((item,index)=>{
                return (
                    <View key={index}><DisplayGoal goal={item}></DisplayGoal></View>
                )
            })
        }
    </View>
)
}

export default GoalHome;