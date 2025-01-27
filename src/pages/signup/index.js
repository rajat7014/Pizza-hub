import React,{useState} from 'react'
import Link from 'next/link';

function Signup() {

 const [credentials, setCredentials] = useState({name:"",email:"", password: "",geolocation:""});
   const handleSubmit = (e)=>{
     e.preventDefault();
     // signup logic after complete backend
 
   };
   const handleChange = (e) =>{
     setCredentials({...credentials,[e.target.name]: e.target.value})
   } 
  return (
    <div style={{height:"90vh",backgroundImage:'url("https://images.pexels.com/photos/1565982/pexels-photo-1565982.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1")',backgroundSize:"cover"
    }}
    className="flex justify-center items-center"
    >
      <div className="container w-full max-w-md">
        <form onSubmit={handleSubmit}
         className="bg-gray-100 dark:bg-gray-900 dark:text-gray-100 border-gradient rounded-lg shadow-2xl px-8 pt-6 pb-8 mb-4"
        >
         <div className="mb-4">
            <label htmlFor="name"
          className="block text-gray-700  dark:text-gray-300 text-sm font-bold mb-2"
          >
            Name
          </label>
          <input 
          placeholder="Enter you name"
          name="name"
          onChange={handleChange}
           type="text" 
           required
           className="shadow appearance-none border border-gray-300 rounded w-full py-2 px-3 focus:border-indigo-700 text-gray-700 dark:text-gray-100  leading-tight focus:outline-none focus:shadow-outline"
          value={credentials.name}
          />
          </div>


          <div className="mb-4">
            <label htmlFor="email"
          className="block text-gray-700  dark:text-gray-300 text-sm font-bold mb-2"
          >
            Email
          </label>
          <input 
          placeholder="Enter you email"
          name="email"
          onChange={handleChange}
           type="email" 
           required
           className="shadow appearance-none border border-gray-300 rounded w-full py-2 px-3 focus:border-indigo-700 text-gray-700 dark:text-gray-100  leading-tight focus:outline-none focus:shadow-outline"
          value={credentials.email}
          />
          </div>

          <div className='mb-4'>
            <label htmlFor="password"
          className="block text-gray-700  dark:text-gray-300 text-sm font-bold mb-2"
          >
            Password
          </label>
          <input 
          placeholder="******"
          onChange={handleChange}
          name="password"
          required
           type="password" 
           className="shadow appearance-none border border-gray-300 rounded w-full py-2 px-3 focus:border-indigo-700 text-gray-700 dark:text-gray-100  leading-tight focus:outline-none focus:shadow-outline"
          value={credentials.password}
          />
          </div>

          <div className='mb-4'>
            <label htmlFor="geolocation"
          className="block text-gray-700  dark:text-gray-300 text-sm font-bold mb-2"
          >
            Address
          </label>
          <input 
          placeholder="Enter your address"
          onChange={handleChange}
          name="geolocation"
          required
           type="text" 
           className="shadow appearance-none border border-gray-300 rounded w-full py-2 px-3 focus:border-indigo-700 text-gray-700 dark:text-gray-100  leading-tight focus:outline-none focus:shadow-outline"
          value={credentials.geolocation}
          />
          </div>

        <div className='flex items-center justify-between'></div>

        <button type='submit'
        className="border text-gray-900 dark:text-gray-100 font-bold dark:border-gray-400 border-gray-900 rounded mr-2 p-2 hover:bg-gradient-to-r from-indigo-700 via-violet-700 to-orange-700  hover:text-gray-100"
        >
          Signup
        </button>
        <Link href={"/login"} style={{ all: "unset" }}>
        <button
        className="border text-gray-900 dark:text-gray-100 font-bold dark:border-gray-400 border-gray-900 rounded mr-2 p-2 hover:bg-gradient-to-r from-indigo-700 via-violet-700 to-orange-700  hover:text-gray-100"
        >
          Already a user?
        </button>
        </Link>
        </form>
      </div>
    </div>
  )
}

export default Signup