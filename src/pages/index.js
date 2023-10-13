import Head from 'next/head'
import path from 'path'
import fsPromises from 'fs/promises'
import { Inconsolata } from 'next/font/google'
import { useState, useEffect } from 'react';

const inco = Inconsolata({ subsets: ['latin'] })

export const getStaticProps = async ()=>{
	const filePath = path.join(process.cwd(), 'lib/data.json');
	const data = await fsPromises.readFile(filePath);
	const objects = JSON.parse(data);
  objects.queries.map( (query)=>{
    let _options = [];
    query.options.map( (option, j)=>{
      _options.push({
        "label": option,
        "correct": (j == query.a),
      })
    });
    query.options = arrayShuffle(_options);
  });
  const _queries = arrayShuffle(objects.queries);

	return {
		props: {"queries": _queries},
	};
}

const arrayShuffle = ([..._array]) => {
  _array.sort( ()=> 0.5 - Math.random());
  return _array;
}


export default function Home({queries}) {

  const [index, setIndex] = useState(0);
  const max = queries.length;
  const hasNext = index < max - 1;
  const hasPrev = index > 0;
  const PRE = ['A', 'B', 'C', 'D', 'E']

  const [show, setShow] = useState(false);
  const [seikai, setSeikai] = useState(false);
  const [maru, setMaru] = useState(0);
  const [batsu, setBatsu] = useState(0);


  function good(){
    if(show || seikai) return;
    setSeikai(true);
    setMaru( maru+1);
    setTimeout( next, 1500)
  }
  function wrong(){
    if(show || seikai) return;
    setShow(true);
    setBatsu( batsu+1);
  }
  function next(){
    setShow(false);
    setSeikai(false);
    if( hasNext ){
      setIndex( index+1 );
    }else{
      setIndex(0);
    }
  }
  function prev(){
    setShow(false);
    setSeikai(false);
    if(hasPrev){
      setIndex( index-1);
    }else{
      setIndex(max-1);
    }
  }
  let query = queries[index];

  const Button = ({label, correct, show, seikai}) => {
    return <button className={`w-full px-3 py-3 text-left ${(!seikai || !correct) ? 'md:hover:bg-gray-900' : ''} ${(seikai && correct) ? 'text-green-500 bg-green-900' : ''} ${show ? (correct ? 'text-green-500' : 'text-red-500') : 'text-white'}`} onClick={()=>{ correct ? good() : wrong()  }}>{label}</button>;
  }

	return (
    <>
    <Head>
      <meta name="robots" content="noindex,nofollow" />
    </Head>
		<main className={`flex flex-wrap min-h-screen min-w-full items-center justify-center p-4 ${inco.className}`}>
      <h1 className={`fixed left-4 top-4 text-xl leading-5 font-bold text-center text-gray-500`}>The Quiz</h1>
      <div className={`fixed right-4 top-4 flex items-center text-xl leading-5`}>
        <p className={`text-green-600`}>{maru}</p>
        <p className={` text-gray-600`}>&nbsp;/&nbsp;</p>
        <p className={`text-red-700`}>{batsu}</p>
      </div>
      <section className={`w-full lg:w-[50%]`}>
        <div className={`relative w-full px-4 py-4 md:py-6 md:px-12 bg-gray-800 rounded-md shadow-md text-lg md:text-xl font-medium leading-5 md:leading-6`}>
          <p>{query.q}</p>
          <span className={`absolute right-2 top-1 text-gray-600 text-xs leading-3`}>{query.id}</span>
        </div>
        <div className={`w-full px-2 py-2 md:px-9 md:py-6 mt-4 bg-gray-800 rounded-md shadow-md text-base md:text-lg divide-y divide-dashed divide-gray-600 leading-5 md:leading-6`}>
          {
            query.options.map( (option, i) => (
              <Button label={`${PRE[i]}. ${option.label}`} correct={option.correct} show={show} seikai={seikai} key={i} />
            ))
          }
        </div>
        <div className={`flex justify-between items-center mt-4`}>
          <button className={`flex items-center rounded-md w-1/3 py-4 pl-6 bg-gray-800 md:hover:bg-pink-900`} onClick={prev}><svg className={`w-6 h-6 text-white`} aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M13 5H1m0 0 4 4M1 5l4-4"/></svg></button>
          <p className={`w-1/3 text-center font-medium text-lg`}>
            <span>{`${index+1}`}</span>
            <small>{` / ${max}`}</small>
          </p>
          <button className={`flex items-center rounded-md w-1/3 justify-end py-4 pr-6 bg-gray-800 md:hover:bg-pink-900`} onClick={next}><svg className={`w-6 h-6 text-white`} aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M1 5h12m0 0L9 1m4 4L9 9"/></svg></button>
        </div>
      </section>
		</main>
    </>
	)
}
