import React from 'react';
import '../css/Welcomepage.css';



class WelcomePage extends React.Component {
  constructor(props) {
    super();
  }


  render() {
    return (
        <div>
          <div className='col-12 welcomepage_container'>
            <span className='wpage_foriz_sect'></span>
            <span className='wpage_soriz_sect'></span>
            <span className='wpage_toriz_sect'></span>

            <div className='row justify-content-center'>
              <div className='wp_wrap_loading_txt'>
                    <span className='wp_txt_dot'></span>
                    <span className='wp_l'>L</span>
                    <span className='wp_icon'></span>
                    <span className='wp_ading'>ADING
                      <span>.</span>
                      <span>.</span>
                      <span>.</span>
                    </span>
              </div>
              <span className='wp_round_ico'></span>
            </div>
          </div>
        </div>
      )
  }
}

export default WelcomePage;
