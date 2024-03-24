"use client"
/** @jsxImportSource frog/jsx */

import React, { useState } from 'react';
import { Button, Frog, TextInput } from 'frog';
import { devtools } from 'frog/dev';
import { handle } from 'frog/next';
import { createClient, cacheExchange, fetchExchange } from '@urql/core';

const app = new Frog({
  assetsPath: '/',
  basePath: '/api'
});

const queryURL = 'https://api.thegraph.com/subgraphs/name/ensdomains/ens';

app.frame('/', (c) => {
  const [inputValue, setInputValue] = useState('');
  const [status, setStatus] = useState('');
  const [fruit, setFruit] = useState('');

  const client = createClient({
    url: queryURL,
    exchanges: [cacheExchange, fetchExchange]
  });

  const handleButtonClick = async () => {
    const query = `
      query {
        domains(where: {name: "${inputValue}"}) {
          resolvedAddress {
            id
          }
        }
      }
    `;

    try {
      const { data } = await client.query(query).toPromise();
      if (data && data.domains && data.domains.length > 0) {
        setStatus('response');
        setFruit(data.domains[0].resolvedAddress.id);
      } else {
        console.log("No domains found.");
        setStatus('');
        setFruit('');
      }
    } catch (error) {
      console.error("Error fetching domains:", error);
      setStatus('');
      setFruit('');
    }
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const { buttonValue, inputText } = c;
  const fruitText = fruit ? ` ${fruit.toLowerCase()}!!` : '';

  return c.res({
    image: (
      <div
        style={{
          alignItems: 'center',
          background: status === 'response' ? 'linear-gradient(to right, #432889, #17101F)' : 'black',
          backgroundSize: '100% 100%',
          display: 'flex',
          flexDirection: 'column',
          flexWrap: 'nowrap',
          height: '100%',
          justifyContent: 'center',
          textAlign: 'center',
          width: '100%',
        }}
      >
        <div
          style={{
            color: 'white',
            fontSize: 60,
            fontStyle: 'normal',
            letterSpacing: '-0.025em',
            lineHeight: 1.4,
            marginTop: 30,
            padding: '0 120px',
            whiteSpace: 'pre-wrap',
          }}
        >
          {status === 'response'
            ? `Nice choice.${fruitText}`
            : 'Welcome!'}
        </div>
      </div>
    ),
    intents: [
      <TextInput placeholder="Enter ENS domain..." onChange={handleInputChange} />,
      <Button onClick={handleButtonClick} value="Graph" />, // Button's value prop could be used as text
      status === 'response' && <Button.Reset onClick={() => { setStatus(''); setFruit(''); }}>Reset</Button.Reset>,
    ],
  });
});

devtools(app);

export const GET = handle(app);
export const POST = handle(app);
