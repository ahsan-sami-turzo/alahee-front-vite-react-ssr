import React from 'react';
import {
  Accordion,
  AccordionItem,
  AccordionItemHeading,
  AccordionItemButton,
  AccordionItemPanel,
} from 'react-accessible-accordion';

const CategoriesMb = ({ categories }) => {


  return (
    <>
      <div className="bg-success mb-n2" data-toggle="collapse" data-target="#collapseExample">
        <h1 className="text-white h5 p-2">
          <i className="fas fa-bars fa-xs ml-2 mr-3" />
          Categories
        </h1>
      </div>
      <div className="collapse" id="collapseExample">
        {categories.length > 0 &&
          categories.map(({ category, subcategories }, i) => (
            <Accordion allowZeroExpanded={true} key={i}>
              <AccordionItem>
                <AccordionItemHeading>
                  <AccordionItemButton>
                    <a
                      href={'/productList/' + category.slug}
                      className="accordion__link"
                    >
                      {category.category_name}
                    </a>
                  </AccordionItemButton>
                </AccordionItemHeading>
                <AccordionItemPanel>
                  <div className="row no-border-radius">
                    {subcategories.length > 0 &&
                      subcategories.map(({ category, lastChilds }, i) => (
                        <div className="col-md-4 col-6" key={i}>
                          <h1 className="h6">
                            <a
                              href={'/productList/' + category.slug}
                              className="accordion__link"
                            >
                              {category.category_name}
                            </a>
                          </h1>
                          <ul className="ml-3 mt-n1">
                            {lastChilds.length > 0 &&
                              lastChilds.map((category, i) => (
                                <li key={i}>
                                  <a
                                    href={'/productList/' + category.slug}
                                    className="accordion__link"
                                  >
                                    {category.category_name}
                                  </a>
                                </li>
                              ))}
                          </ul>
                        </div>
                      ))}
                  </div>
                </AccordionItemPanel>
              </AccordionItem>


            </Accordion>
          ))}


        <Accordion>
          <AccordionItem>
            <AccordionItemHeading>
              <AccordionItemButton>
                <a
                  href="/moreCategory"
                  className="accordion__link"
                >
                  More
                </a>
              </AccordionItemButton>
            </AccordionItemHeading>
          </AccordionItem>
        </Accordion>


      </div>
    </>
  );
};

export default CategoriesMb;