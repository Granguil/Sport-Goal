import React, { useEffect, useState } from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';
import * as EFS from 'expo-file-system';
import axios from 'axios';
import * as DatePicker from '@react-native-community/datetimepicker';
import { stravaCredentials } from './StravaCredentials';
import os from 'os';


const filePath = EFS.documentDirectory+"/sports.txt";

export default function App() {
  const [data, setData] = useState({});
  const [dataFromDate, setDataFromDate] = useState({});
  const [isLoad, setLoad] = useState(false);
  const [isLoadfromDate, setLoadFromDate] = useState(false);
  const [fromDate, setFromDate]=useState(new Date());
  const [toDate, setToDate] = useState(new Date());
  const [selectDate, setSelectDate] = useState(0);
  const Update =(isFromDate)=>{
    isFromDate?setLoadFromDate(false):setLoad(false);

   const credentials = stravaCredentials;

    const options={
      method:"POST",
      data:JSON.stringify(credentials),
      url:"https://www.strava.com/api/v3/oauth/token",
      headers:{ 'content-type': 'application/json' },
    }

    axios(options)
      .then(value=>{
        const stravaHeaders = {"Authorization": "Bearer "+value.data.access_token};
        const date = new Date(), y = date.getFullYear(), m = date.getMonth();
        const firstDay = (isFromDate? fromDate: new Date(y, m, 1)).getTime()/1000;
        const lastDay = (isFromDate ? toDate : new Date()).getTime()/1000;
        const stravaOption = {
          headers: stravaHeaders,
          method:"GET",
          url:"https://www.strava.com/api/v3/athlete/activities?per_page=200&after="+firstDay+"&before="+lastDay
        }
      
        axios(stravaOption)
          .then(value=>
          {
            let object = {};
            for(const v of value.data){
              const s = v.type;
              if(object[s] == undefined){
                object[s]={};
                object[s].activities=1;
                object[s].distance=v.distance/1000;
                object[s].elevation=Math.floor(v.total_elevation_gain);
                object[s].timeMinute=Math.floor(v.elapsed_time/60);
                object[s].timeHour=0;
              }else{
                object[s]={
                  activities:1+object[s].activities,
                  distance:v.distance/1000+object[s].distance,
                  elevation:Math.floor(v.total_elevation_gain)+object[s].elevation,
                  timeMinute:Math.floor(v.elapsed_time/60+object[s].timeMinute),
                  timeHour:object[s].timeHour
                };
              }

              if(object[s].timeMinute>=60){
                object[s].timeHour+=Math.floor(object[s].timeMinute/60);
                object[s].timeMinute=Math.floor(object[s].timeMinute%60);
              }
            }
            if(isFromDate){
              setDataFromDate({...object});
              setLoadFromDate(true);
            }else{
              setData({...object});
              setLoad(true);
              if(os.platform == undefined || os.platform()!='browser'){
              EFS.writeAsStringAsync(filePath,JSON.stringify(object));
              }
            }
          })
          .catch(err=>
            console.log(err.response.data.errors)
          );
      });
  }

  useEffect(()=>{
    if(os.platform == undefined || os.platform()!='browser'){
    EFS.getInfoAsync(filePath).then(file=>{
      if(file.exists)
      {
        EFS.readAsStringAsync(filePath).then(value=>{
          const oldData = JSON.parse(value);
          setData({...oldData});
          setLoad(true);
        })
      }
      else
      {
        Update(false);
      }
    })
  }else{
    Update(false);
  }
  },[])
  return (
    <View style={styles.container}>
      <View>
        <Text>Activités du Mois en Cours</Text>
        <Button onPress={()=>Update(false)} title='Mettre à jour'/>
        {isLoad?Object.entries(data).map((sportEntry,index)=>{
          const sport = sportEntry[0];
          return (
            <View key={index}><Text>{sport} : {data[sport].activities} activités, {data[sport].distance.toFixed(3)} km, {data[sport].timeHour}H{data[sport].timeMinute}, {data[sport].elevation}m de dénivelés.</Text></View>
          )
        }):<Text>Chargement ...</Text>}
      </View>
      <View>
        <Text>Activités entre le : {fromDate.getDate()+"/"+(fromDate.getMonth()+1)+"/"+fromDate.getFullYear()} et {toDate.getDate()+"/"+(toDate.getMonth()+1)+"/"+toDate.getFullYear()}</Text>
        <Button on onPress={()=>setSelectDate(1)} title="choisir date"></Button>
        {selectDate==1?<DatePicker.default value={fromDate} onChange={date=>{setFromDate(new Date(date.nativeEvent.timestamp));setSelectDate(2);}}></DatePicker.default>:""}
        {selectDate==2?<DatePicker.default value={toDate} onChange={date=>{setToDate(new Date(date.nativeEvent.timestamp));setSelectDate(0);}}></DatePicker.default>:""}
        <Button onPress={()=>Update(true)} title='Mettre à jour'/>
        {isLoadfromDate?Object.entries(dataFromDate).map((sportEntry,index)=>{
          const sport = sportEntry[0];
          return (
            <View key={index}><Text>{sport} : {dataFromDate[sport].activities} activités, {dataFromDate[sport].distance.toFixed(3)} km, {dataFromDate[sport].timeHour}H{dataFromDate[sport].timeMinute}, {dataFromDate[sport].elevation}m de dénivelés.</Text></View>
          )
        }):<Text>Chargement ...</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection:'column'
  },
});
