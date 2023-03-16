# Configuration Management
## CM-2-2 - Baseline Configuration | Automation Support for Accuracy and Currency

Maintain the currency, completeness, accuracy, and availability of the baseline configuration of the system using [ACF-defined automated mechanisms].

## OPS Implementation

TODO: Seek hybrid inheritance from cloud.gov/OPS and review with ACF OCIO

OPS utilizes a Continuous Integration (CI) and Continuous Deployment (CD) process which includes end-to-end and unit testing of OPS functionality that must satisfy all test conditions successfully before allowing a deployment or promotion to any environment. The deployment and promotion process includes changes to documentation persisted in the OPS GitHub repository.

OPS utilizes a Continuous Deployment (CD) process using GitHub such that duly-authorized and approved changes, via the mechanism of a GitHub Pull Request, are automatically deployed at the time the requested code branch (changes) are merged to the destiantion branch (environment). GitHub maintains full revision and release history for OPS.

### Related Content

* [cm-7](../cm-07/index.md)
* [ia-3](../ia-03/index.md)
* [ra-5](../ra-05/index.md)
