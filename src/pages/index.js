import Head from 'next/head'
import path from 'path'
import fsPromises from 'fs/promises'
import { Inconsolata } from 'next/font/google'
import { useState, useEffect, useCallback } from 'react';

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


	const [phase, setPhase] = useState(0);
	const [show, setShow] = useState(false);
	const [seikai, setSeikai] = useState(false);
	const [maru, setMaru] = useState(0);
	const [batsu, setBatsu] = useState(0);
	const [_spendTime, _setSpendTime] = useState(0);
	const [spendTime, setSpendTime] = useState(0);
	const [bads, setBads] = useState([]);



	function good(){
		if(show || seikai) return;
		setSeikai(true);
		setMaru( maru+1);
		stopWatch();
		setTimeout( next, 1500)
	}
	function wrong(){
		if(show || seikai) return;
		setShow(true);
		setBatsu( batsu+1);
		stopWatch();
		bads.push(query);
	}
	function next(){
		setShow(false);
		setSeikai(false);
		
		if( hasNext ){
			startWatch();
			setIndex( i => i + 1 );
		}else{
			setPhase(2);
		}
	}

	let query = queries[index];

	function go(){
		setPhase(1);
		startWatch();
	}

	function exit(){
		stopWatch();
		setPhase(2);
	}
	
	function restart(){
		setBads([]);
		setIndex(0);
		setShow(false);
		setSeikai(false);
		setMaru(0);
		setBatsu(0);
		_setSpendTime(0);
		setSpendTime(0);
		setPhase(1);
		startWatch();
	}

	function startWatch(){
		_setSpendTime(new Date().getTime());
	}
	function stopWatch(){
		setSpendTime( spendTime + new Date().getTime() - _spendTime);
	}

	const Button = ({label, correct, show, seikai, disabled}) => {
		return <button className={`w-full px-3 py-3 text-left ${(!seikai || !correct) ? 'md:enabled:hover:bg-gray-900' : ''} ${(seikai && correct) ? 'text-green-500 bg-green-900' : ''} ${show ? (correct ? 'text-green-500' : 'text-red-500') : 'text-white'}`} onClick={()=>{ correct ? good() : wrong()  }} disabled={disabled}>{label}</button>;
	}	

	const keyFunc = ((event) => {
		const _options = query.options;

		switch( event.keyCode) {
			case 65:
				_options[0].correct ? good() : wrong();
				break;
			case 66:
				_options[1].correct ? good() : wrong();
				break;
			case 67:
				_options[2].correct ? good() : wrong();
				break;
			case 68:
				_options[3].correct ? good() : wrong();
				break;
			case 69:
				_options[4].correct ? good() : wrong();
				break;
			case 27:
				exit();
				break;
			case 13, 39:
				if( show && !seikai) next();
				break;
		}
	});

	useEffect( ()=>{
		document.addEventListener( "keydown", keyFunc, false);
		return (()=>{
			document.removeEventListener( "keydown", keyFunc, false);
		});
	});

	return (
		<>
		<Head>
			<meta name="robots" content="noindex,nofollow" />
			<title>The Quiz</title>
		</Head>
		<main className={`flex flex-wrap md:min-h-screen min-w-full items-center justify-center p-4 pt-14 md:pt-0 ${inco.className}`}>
			<h1 className={`fixed left-4 top-4 text-xl leading-5 font-bold text-center text-gray-500`}>The Quiz</h1>
			<div className={`fixed right-4 top-4 flex items-center text-xl leading-5`}>
				<p className={`text-green-600`}>{maru}</p>
				<p className={` text-gray-600`}>&nbsp;/&nbsp;</p>
				<p className={`text-red-700`}>{batsu}</p>
			</div>

			{/* start button */}
			<section className={`${phase==0 ? 'show' : 'hidden'} pt-20`} onClick={go}>
				<button className={`commonButton px-8 justify-center text-xl`}>
					<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" /></svg>
					<span className={`pl-2`}>START</span>
				</button>
			</section>

			{/* quiz */}
			<section className={`${phase==1 ? 'show' : 'hidden'} w-full lg:w-[50%]`}>
				<div className={`commonPanel w-full px-4 py-4 md:py-6 md:px-12 text-lg md:text-xl font-medium leading-5 md:leading-6`}>
					<p>{query.q}</p>
					<span className={`absolute right-2 top-1 text-gray-600 text-xs leading-3`}>{query.id}</span>
				</div>
				<div className={`commonPanel w-full px-2 py-2 md:px-9 md:py-6 mt-4 text-base md:text-lg divide-y divide-dashed divide-gray-600 leading-5 md:leading-6`}>
					{
						query.options.map( (option, i) => (
							<Button label={`${PRE[i]}. ${option.label}`} correct={option.correct} show={show} seikai={seikai} key={i} disabled={false} />
						))
					}
				</div>
				<div className={`flex justify-between items-center mt-4`}>
					<button className={`commonButton w-1/3 justify-center`} onClick={exit}>
						<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
						<span className={`pl-2`}>EXIT</span>
					</button>
					<p className={`w-1/3 text-center font-medium text-xl md:text-2xl`}>
						<span>{`${index+1}`}</span>
						<small>{` / ${max}`}</small>
					</p>
					<button className={`commonButton w-1/3 justify-end pr-6`} onClick={next} disabled={!(show && !seikai)}>
						<svg className={`w-6 h-6 text-white`} aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M1 5h12m0 0L9 1m4 4L9 9"/></svg>
					</button>
				</div>
			</section>

			{/* result */}
			<section className={`${phase==2 ? 'show' : 'hidden'} w-full lg:w-[50%] grid grid-cols-2 gap-4 py-4`}>
				<div className={`commonPanel flex flex-wrap justify-center py-6 pb-4`}>
					<span className={`flex justify-center items-center w-10 h-10 bg-green-600 rounded-full`}>
						<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="black" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M6.633 10.5c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 012.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 00.322-1.672V3a.75.75 0 01.75-.75A2.25 2.25 0 0116.5 4.5c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 01-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 00-1.423-.23H5.904M14.25 9h2.25M5.904 18.75c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 01-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 10.203 4.167 9.75 5 9.75h1.053c.472 0 .745.556.5.96a8.958 8.958 0 00-1.302 4.665c0 1.194.232 2.333.654 3.375z" /></svg>
					</span>
					<span className={`w-full text-center text-2xl text-green-600`}>{maru}</span>
				</div>
				<div className={`commonPanel flex flex-wrap justify-center py-6 pb-4`}>
					<span className={`flex justify-center items-center w-10 h-10 bg-red-700 rounded-full`}>
					<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="black" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 15h2.25m8.024-9.75c.011.05.028.1.052.148.591 1.2.924 2.55.924 3.977a8.96 8.96 0 01-.999 4.125m.023-8.25c-.076-.365.183-.75.575-.75h.908c.889 0 1.713.518 1.972 1.368.339 1.11.521 2.287.521 3.507 0 1.553-.295 3.036-.831 4.398C20.613 14.547 19.833 15 19 15h-1.053c-.472 0-.745-.556-.5-.96a8.95 8.95 0 00.303-.54m.023-8.25H16.48a4.5 4.5 0 01-1.423-.23l-3.114-1.04a4.5 4.5 0 00-1.423-.23H6.504c-.618 0-1.217.247-1.605.729A11.95 11.95 0 002.25 12c0 .434.023.863.068 1.285C2.427 14.306 3.346 15 4.372 15h3.126c.618 0 .991.724.725 1.282A7.471 7.471 0 007.5 19.5a2.25 2.25 0 002.25 2.25.75.75 0 00.75-.75v-.633c0-.573.11-1.14.322-1.672.304-.76.93-1.33 1.653-1.715a9.04 9.04 0 002.86-2.4c.498-.634 1.226-1.08 2.032-1.08h.384" /></svg>
					</span>
					<span className={`w-full text-center text-2xl text-red-700`}>{batsu}</span>
				</div>
				<div className={`commonPanel col-span-2 p-6`}>
					<span className={`flex items-center justify-center text-xl`}>
						<span><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></span>
						<span className={`pl-2`}>{`${(spendTime/(maru+batsu)/10 | 0)/100 } seconds / question`}</span>
					</span>
				</div>
				<button className={`commonButton col-span-2 justify-center`} onClick={restart}>
					<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" /></svg>
					<span className={`ml-2`}>RESTART</span>
				</button>
				{
					bads.map( (_query, i)=>(
						<div key={i} className={`col-span-2`}>
							<div className={`commonPanel w-full px-4 py-4 md:py-6 md:px-12 text-lg md:text-xl font-medium leading-5 md:leading-6`}>
								<div className={`pt-4 pb-2`}>
									{_query.q}
								</div>
								<div className={`text-base md:text-lg divide-y divide-dashed divide-gray-600 leading-5 md:leading-6`}>
								{
								_query.options.map( (option, j) => (
									<Button label={`${PRE[j]}. ${option.label}`} correct={option.correct} show={true} seikai={false} key={j} disabled={true} />
								))
								}
								</div>
							</div>
						</div>
					))
				}
			</section>

		</main>
		</>
	);


}
