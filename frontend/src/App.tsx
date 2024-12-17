
import { useNavigate } from 'react-router';
import './App.css'

function App() {

  const navigate=useNavigate();
  

  return (
    <div className='h-[100vh] w-[100vw] bg-stone-700 flex justify-center items-center'>
     <div className='h-[85%] w-[80%]  rounded-xl grid grid-rows-1 grid-cols-2 mx-auto my-auto '>
      <div className=' flex items-center justify-center '>

        <div className='h-[90%] w-[90%] rounded-xl overflow-hidden'><img alt="chess" src="https://ideogram.ai/assets/image/lossless/response/hCP2f72sRui3Smwtf2ZQiA" className='object-cover h-full w-full '/></div>

      </div>
      <div className=' flex flex-col items-center justify-center'>
        <div className='h-[50%] w-full flex justify-center items-center '>
          <h1 className='w-[80%] text-white text-5xl font-bold text-center tracking-wide '>Play Chess Online on the #3 Site!</h1>
        </div>
        <div className='h-[50%] w-full flex flex-col justify-start items-center '>
          <button className='h-[30%] w-[60%] font-bold text-center text-3xl tracking-wide text-white bg-lime-400 rounded-2xl hover:bg-lime-500' onClick={()=>navigate("/arena")}>Play Online</button>
        </div>
      </div>

     </div>
    </div>
  )
}

export default App
