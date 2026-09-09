// Display data from the project's seed catalog; no real reservation is created.
const tea='./design/photo-teapot-dark.jpg', food='./design/photo-gyoza-dark.jpg'
export const menu=[
  {id:1,cat:'tea',name:'Улун с горным мёдом',price:480,tags:['veg','top'],description:'Полуферментированный чай с тёплыми нотами и долгим послевкусием.',image:tea},
  {id:2,cat:'tea',name:'Маття церемониальная',price:520,tags:['veg'],description:'Каменный помол, насыщенный умами и мягкая горчинка.',image:tea},
  {id:3,cat:'dim',name:'Хар Гао с креветкой',price:590,tags:['top'],description:'Полупрозрачное тесто, сочная начинка, подача на пару.',image:food},
  {id:4,cat:'dim',name:'Баоцзы с уткой',price:560,tags:[],description:'Пышные паровые булочки с томлёной уткой и хойсин.',image:food},
  {id:5,cat:'hot',name:'Лапша Дан-Дан',price:640,tags:['spicy'],description:'Пшеничная лапша, кунжутный соус и сычуаньский перец.',image:food},
  {id:6,cat:'sweet',name:'Моти с кунжутом',price:380,tags:['veg','top'],description:'Рисовое тесто и чёрный кунжут.',image:food},
]
export const locations=[['pokrovka','на Покровке','Покровка, 12'],['patriki','на Патриках','Малая Бронная, 24'],['gorky','в Парке Горького','Крымский Вал, 9']].map(([slug,name,address],i)=>({id:String(i+1),slug,name:'ChaiShopper '+name,address:address+', Москва',hours:'Пн–Вс · 10:00–23:00',phone:'Демонстрационная точка',latitude:55.75,longitude:37.62,hiddenItems:i===1?[5]:[],localItems:i===0?[6]:[],x:25+i*23,y:35+i*10}))
export const ceremonies=[['Гунфу Ча','Классическая церемония пролива улуна.',60,2400],['Тядо · Матча','Взбивание маття венчиком тясэн.',45,1900],['Вечерний Пуэр','Выдержанный чай для завершения дня.',75,2800]].map(([name,description,durationMin,price],i)=>({id:String(i+1),name,description,durationMin,price,image:tea}))
export const fetchMenuItems=async()=>menu
export const fetchLocations=async()=>locations
export const fetchLocationBySlug=async(slug:string)=>locations.find(l=>l.slug===slug)||null
export const fetchCeremonies=async()=>ceremonies
export const fetchMenuCategories=async()=>[{id:'tea',name:'Чай'},{id:'hot',name:'Горячее'},{id:'dim',name:'Дим-сам'},{id:'sweet',name:'Десерты'}]
