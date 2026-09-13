import Vyoo from '../vyoo';
export default async function Page({params}:{params:Promise<{area:string}>}){const {area}=await params;return <Vyoo initialArea={area}/>}
