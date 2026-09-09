export type Car=any
export type Term=any
const photo='https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1000&q=80'
const rows=[['BMW 530i','bmw',4500000,2022,'sedan'],['Mercedes-Benz E 200','mercedes',5200000,2023,'sedan'],['Audi Q5','audi',4800000,2022,'suv'],['Toyota Land Cruiser','toyota',8700000,2024,'suv'],['BMW X3','bmw',5600000,2023,'suv'],['Hyundai Sonata','hyundai',2800000,2021,'sedan']]
export const cars=rows.map(([title,brand,price,year,body],i)=>({databaseId:i+1,title,slug:'demo-car-'+(i+1),price:Number(price)/100,year,mileage:15000+i*6000,horsepower:190+i*15,engineVolume:'2.0',transmission:'Автомат',driveType:'Полный',fuel:'Бензин',color:'Серый',country:'Германия',vin:null,imageUrl:photo,gallery:null,excerpt:'Демонстрационное предложение для просмотра интерфейса. Фото иллюстративное.',content:'<p>Карточка показывает параметры автомобиля и сценарий обращения. Это пример данных, не реальное предложение продажи.</p>',brands:{nodes:[{name:String(title).split(' ')[0],slug:brand}]},bodyTypes:{nodes:[{name:body==='suv'?'Кроссовер':'Седан',slug:body}]}}))
export const getCars=async(opts:any={})=>cars.filter(c=>(!opts.search||c.title.toLowerCase().includes(opts.search.toLowerCase()))&&(!opts.brand||c.brands.nodes[0].slug===opts.brand)&&(!opts.bodyType||c.bodyTypes.nodes[0].slug===opts.bodyType)).sort((a:any,b:any)=>(a[opts.orderby||'databaseId']-b[opts.orderby||'databaseId'])*(opts.order==='ASC'?1:-1))
export const getCarBySlug=async(slug:string)=>cars.find(c=>c.slug===slug)||null
export const getBrands=async()=>[...new Map(cars.map(c=>[c.brands.nodes[0].slug,c.brands.nodes[0]])).values()]
export const getBodyTypes=async()=>[{name:'Кроссовер',slug:'suv'},{name:'Седан',slug:'sedan'}]
export async function gqlFetch<T>():Promise<T>{return {submitLead:{success:true}} as T}
